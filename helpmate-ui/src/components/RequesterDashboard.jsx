// src/components/RequesterDashboard.jsx (FINAL FIXED VERSION)
import React, { useState, useEffect } from 'react'; 
import TaskPostingForm from './TaskPostingForm'; 
import { getRequestedTasks } from '../services/taskClient'; 
import ChatModal from './ChatModal'; 
import HelperMapSection from './HelperMapSection'; 

// --- Local Components ---
const RequesterTaskCard = ({ task, onStartChat }) => { 
    const isCompleted = task.status === 'completed';
    const isAssigned = task.status === 'assigned' || task.status === 'in_progress';
    const helperName = task.helper ? task.helper.name : 'Awaiting Helper';
    const helperRating = task.helper ? task.helper.rating : 'N/A';
    const canChat = isAssigned && task.assignment_id;

    let statusTag, tagColor, buttonText, buttonHandler;
    
    if (isCompleted) {
        statusTag = '✅ Completed';
        tagColor = 'bg-green-100 text-green-800';
        buttonText = 'Rate Helper';
        buttonHandler = () => console.log('Rating helper for task:', task.taskId);
    } else if (canChat) { 
        statusTag = '💬 Chat Active';
        tagColor = 'bg-yellow-100 text-yellow-800';
        buttonText = 'View Chat';
        buttonHandler = () => onStartChat(task); 
    } else if (isAssigned && !task.assignment_id) { 
        statusTag = '⏳ Assignment Pending';
        tagColor = 'bg-red-100 text-red-800';
        buttonText = 'Awaiting Chat ID';
        buttonHandler = () => console.log('Waiting for assignment ID from API.'); 
    } else { 
        statusTag = '📝 Open';
        tagColor = 'bg-blue-100 text-blue-800';
        buttonText = 'View Applicants';
        buttonHandler = () => console.log('Viewing applicants for task:', task.taskId);
    }
    
    const payDisplay = task.budget 
        ? `₹${task.budget}` 
        : (task.reward_xp ? `+${task.reward_xp} XP` : 'N/A');

    return (
        <div className="requester-task card-hover border border-gray-200 bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{isCompleted ? '📦' : (isAssigned ? '🤝' : '📝')}</span>
                </div>
                <div className="text-right">
                    <div className="text-sm text-gray-500">{task.createdAt}</div>
                    <div className="text-lg font-semibold text-emerald-600">
                        {isAssigned ? '1 Helper Assigned' : `${task.applicationsCount || 0} Applications`}
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            <p className="text-gray-600 text-sm mb-4">
                Pay: {payDisplay} • Type: {task.type} • 
                {isAssigned ? ` Helper: ${helperName} (⭐ ${helperRating})` : ' Awaiting Acceptance'}
            </p>

            <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${tagColor}`}>{statusTag}</span>

                <button 
                    onClick={buttonHandler} 
                    disabled={!canChat && buttonText === 'View Chat'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white 
                    ${isCompleted || !canChat ? 'bg-gray-500 hover:bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---
const RequesterDashboard = ({ isVerified, onToast, socket, currentUserId }) => { 
    const [currentView, setCurrentView] = useState('tracking'); 
    const [requestedTasks, setRequestedTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [showChatModal, setShowChatModal] = useState(false);
    const [currentChatData, setCurrentChatData] = useState(null); 

    // --- Fetch Tasks ---
    const fetchTasks = async () => {
        setIsLoadingTasks(true);
        try {
            const fetchedTasks = await getRequestedTasks(); 
            const formattedTasks = fetchedTasks.map(task => ({
                ...task,
                taskId: task.task_id || task.id, 
                createdAt: new Date(task.created_at).toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit' }),
                helper: task.helper_first_name 
                    ? { name: task.helper_first_name, rating: task.helper_rating } 
                    : null,
                assignment_id: task.assignment_id,
            }));
            setRequestedTasks(formattedTasks);
        } catch (error) {
            console.error("Failed to fetch requested tasks:", error);
            onToast(`Error loading your tasks: ${error.message}`);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    useEffect(() => {
        if (currentView === 'tracking') fetchTasks();
    }, [currentView]);

    // 🔁 Auto-refresh every 7 seconds
    useEffect(() => {
        if (currentView !== 'tracking') return;
        const interval = setInterval(fetchTasks, 7000);
        return () => clearInterval(interval);
    }, [currentView]);

    // --- Handle Chat Opening ---
    const handleStartChat = (task) => {
        if (!task.assignment_id) {
            return onToast('Chat unavailable: Missing Assignment ID.');
        }

        const helperData = task.helper || { name: 'Helper', rating: 'N/A' };

        setCurrentChatData({
            taskId: task.taskId,
            assignmentId: String(task.assignment_id),
            taskTitle: task.title,
            requesterName: helperData.name,
            requesterInitial: helperData.name.charAt(0).toUpperCase(),
            messages: [],
        });

        setShowChatModal(true);
    };

    const handlePostSuccess = (message, isError = false) => {
        onToast(message);
        if (!isError) {
            setCurrentView('tracking');
            fetchTasks(); // Immediately refresh after posting new task
        }
    };

    const handleCreateTaskClick = () => {
        setCurrentView('postTask');
        onToast('You are now creating a new task.');
    };

    return (
        <>
            {/* --- VIEW SWITCH --- */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    <div className="bg-gray-100 p-1 rounded-full flex items-center">
                        <button 
                            onClick={() => setCurrentView('tracking')}
                            className={`category-toggle px-4 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'tracking' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
                        >
                            📦 My Tasks & Helpers
                        </button>
                        <button 
                            onClick={handleCreateTaskClick}
                            className={`category-toggle px-4 py-2 rounded-full text-sm font-medium transition-all ${currentView === 'postTask' ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
                        >
                            📝 Post New Task
                        </button>
                    </div>
                </div>
            </div>

            {/* --- POST NEW TASK --- */}
            {currentView === 'postTask' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
                    <TaskPostingForm isVerified={isVerified} onPostSuccess={handlePostSuccess} />
                </div>
            )}

            {/* --- TASK TRACKING VIEW --- */}
            {currentView === 'tracking' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {isLoadingTasks && <p className="col-span-full text-center text-gray-500">Loading your requested tasks...</p>}

                        {!isLoadingTasks && requestedTasks.length === 0 && (
                            <p className="col-span-full text-center text-gray-500">
                                You haven't posted any tasks yet! Use the 'Post New Task' button to start.
                            </p>
                        )}

                        {!isLoadingTasks && requestedTasks.map(task => (
                            <RequesterTaskCard 
                                key={task.taskId} 
                                task={task} 
                                onStartChat={handleStartChat} 
                            />
                        ))}
                    </div>

                    <HelperMapSection />
                </>
            )}

            {/* --- FLOATING POST BUTTON --- */}
            <div className="fixed bottom-6 right-6">
                <button 
                    onClick={handleCreateTaskClick}
                    className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-2xl"
                >
                    ➕
                </button>
            </div>

            {/* --- CHAT MODAL --- */}
            <ChatModal 
                show={showChatModal}
                onClose={() => setShowChatModal(false)}
                chatData={currentChatData}
                onToast={onToast}
                socket={socket}
                currentUserId={currentUserId}
            />
        </>
    );
};

export default RequesterDashboard;
