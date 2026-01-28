// src/components/ChatModal.jsx (FINAL FIXED VERSION)
import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- ChatMessage Component ---
const ChatMessage = ({ message, isOwn }) => {
    const avatarInitial = isOwn ? 'Y' : message.requesterInitial || 'P';
    const bgClass = isOwn ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-900';
    const avatarBg = isOwn
        ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
        : 'bg-gradient-to-br from-blue-400 to-purple-500';
    const justifyClass = isOwn ? 'justify-end' : 'justify-start';
    const flexDirection = isOwn ? 'flex-row-reverse' : 'flex-row';

    return (
        <div className={`flex ${flexDirection} items-start space-x-2 ${justifyClass}`}>
            <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                {avatarInitial.charAt(0).toUpperCase()}
            </div>
            <div className={`flex-1 flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div>
                    <div className={`${bgClass} rounded-lg p-3 max-w-xs`}>
                        <p className="text-sm">{message.message}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {message.time}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- ChatModal Component ---
const ChatModal = ({ show, onClose, chatData, onToast, socket, currentUserId }) => {
    const MAX_CHARS = 500;
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const chatMessagesRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        if (chatMessagesRef.current) {
            setTimeout(() => {
                chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
            }, 100);
        }
    }, []);

    // --- Format message and check ownership ---
    const formatMessage = useCallback(
        (msg) => {
            const senderIdNum = Number(msg.sender_id);
            const currentUserNum = Number(currentUserId);

            return {
                message_id: msg.message_id || Date.now(),
                message: msg.message,
                sender_id: senderIdNum,
                isOwn: senderIdNum === currentUserNum,
                time: new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                requesterInitial: senderIdNum === currentUserNum ? 'Y' : (chatData?.requesterInitial || 'H'),
            };
        },
        [currentUserId, chatData]
    );

    // --- Real-time Chat Setup ---
    useEffect(() => {
        if (!show || !socket || !chatData?.assignmentId) return;

        const assignmentId = chatData.assignmentId;
        setMessages([]);

        socket.emit('joinAssignmentChat', { assignmentId });

        const handleChatHistory = ({ assignmentId: id, messages }) => {
            if (id !== assignmentId) return;
            const formatted = (messages || []).map(formatMessage);
            setMessages(formatted);
            scrollToBottom();
        };

        const handleNewMessage = (msg) => {
            if (msg.assignment_id !== assignmentId) return;
            setMessages((prev) => [...prev, formatMessage(msg)]);
            scrollToBottom();
        };

        const handleChatError = (error) => {
            onToast(`Chat Error: ${error.message}`);
        };

        socket.on('chatHistory', handleChatHistory);
        socket.on('newMessage', handleNewMessage);
        socket.on('chatError', handleChatError);

        document.body.style.overflow = 'hidden';

        return () => {
            socket.off('chatHistory', handleChatHistory);
            socket.off('newMessage', handleNewMessage);
            socket.off('chatError', handleChatError);
            document.body.style.overflow = 'auto';
            setMessageInput('');
        };
    }, [show, socket, chatData?.assignmentId, formatMessage, onToast, scrollToBottom]);

    // --- Handle Message Send ---
    const handleSend = (e) => {
        e.preventDefault();
        const message = messageInput.trim();
        if (!message || !socket || !chatData?.assignmentId) return;

        socket.emit('sendMessage', {
            assignmentId: chatData.assignmentId,
            message,
        });

        setMessageInput('');
        scrollToBottom();
    };

    // --- Quick Replies ---
    const handleQuickReply = (action) => {
        if (!socket || !chatData?.assignmentId) return;

        let quickMessage = '';

        if (action.includes('Share Location')) {
            quickMessage = "📍 I'm currently at: Koramangala 5th Block, near Jyoti Nivas College. ETA: 10 minutes.";
            onToast('Location shared successfully!');
        } else if (action.includes('Task Complete')) {
            quickMessage = '✅ Task completed successfully! Please confirm and rate.';
            onToast('Task marked complete!');
        } else if (action.includes('Call Now')) {
            onToast('Initiating call...');
            return;
        }

        if (quickMessage) {
            socket.emit('sendMessage', {
                assignmentId: chatData.assignmentId,
                message: quickMessage,
            });
        }

        scrollToBottom();
    };

    if (!show || !chatData?.requesterName) return null;

    return (
        <div id="chatModal" className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                    {/* --- Header --- */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {chatData.requesterInitial || 'P'}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    Chat with {chatData.requesterName}
                                </h3>
                                <p className="text-sm text-gray-600">{chatData.taskTitle}</p>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Online</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* --- Messages --- */}
                    <div
                        id="chatMessages"
                        ref={chatMessagesRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96"
                    >
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={msg.message_id || index}
                                message={msg}
                                isOwn={msg.isOwn}
                            />
                        ))}
                    </div>

                    {/* --- Quick Actions --- */}
                    <div className="px-4 py-2 border-t border-gray-100">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handleQuickReply('📍 Share Location')}
                                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                                📍 Share Location
                            </button>
                            <button
                                onClick={() => handleQuickReply('📞 Call Now')}
                                className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                            >
                                📞 Call Now
                            </button>
                            <button
                                onClick={() => handleQuickReply('✅ Task Complete')}
                                className="flex-1 bg-purple-50 text-purple-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                            >
                                ✅ Task Complete
                            </button>
                        </div>
                    </div>

                    {/* --- Input Box --- */}
                    <div className="p-4 border-t border-gray-200">
                        <form
                            id="chatForm"
                            className="flex items-end space-x-2"
                            onSubmit={handleSend}
                        >
                            <button
                                type="button"
                                onClick={() => onToast('File attachment feature coming soon!')}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                </svg>
                            </button>
                            <div className="flex-1">
                                <textarea
                                    rows="1"
                                    maxLength={MAX_CHARS}
                                    placeholder="Type your message..."
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend(e);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <span
                                        className={`text-xs ${
                                            messageInput.length > MAX_CHARS - 50
                                                ? 'text-red-500'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {messageInput.length}/{MAX_CHARS}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Press Enter to send
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!messageInput.trim() || !socket}
                                className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
