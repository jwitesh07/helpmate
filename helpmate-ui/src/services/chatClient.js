// src/services/chatClient.js
import { io } from 'socket.io-client';

const SOCKET_URL = "http://localhost:3000";

let socket = null;

/**
 * Gets the JWT token from local storage.
 */
const getAuthToken = () => localStorage.getItem('authToken');

/**
 * Connects to the Socket.IO server securely and sets up listeners.
 */
export const connectChat = (onNewMessage, onHistoricalMessages, onError) => {
    const token = getAuthToken();
    if (!token) {
        onError("Authentication token not found. Please log in.");
        return null;
    }
    
    // Disconnect any existing connection first
    if (socket && socket.connected) {
        socket.disconnect();
    }

    // Connect with the token in the auth payload for secure handshake
    socket = io(SOCKET_URL, {
        auth: {
            token: token
        }
    });
    
    socket.on('connect', () => {
        console.log('Chat Socket Connected', socket.id);
    });
    
    socket.on('disconnect', () => {
        console.log('Chat Socket Disconnected');
    });
    
    socket.on('authError', (message) => { // Handle backend authentication failures
        onError(message);
        socket.disconnect();
    });

    // 🟢 Set up the specific listeners used by ChatModal.jsx
    socket.on('historicalMessages', onHistoricalMessages);
    socket.on('newMessage', onNewMessage);
    socket.on('error', onError);

    return socket;
};

/**
 * Disconnects the socket and cleans up.
 */
export const disconnectChat = () => {
    if (socket) {
        // Remove listeners before disconnecting to prevent memory leaks
        socket.off('historicalMessages');
        socket.off('newMessage');
        socket.off('error');
        socket.disconnect();
        socket = null;
    }
};

/**
 * Joins a specific assignment chat room.
 * Corresponds to the 'joinAssignmentChat' event in socketHandler.js
 */
export const joinChatRoom = (taskId, assignmentId) => {
    if (socket && socket.connected) {
        socket.emit('joinAssignmentChat', { taskId, assignmentId });
    }
};

/**
 * Sends a new message via the socket.
 * Corresponds to the 'sendMessage' event in socketHandler.js
 */
export const sendChatMessage = (text) => {
    if (socket && socket.connected) {
        // The server will use the stored user ID and room (currentAssignmentId)
        socket.emit('sendMessage', text);
    }
};