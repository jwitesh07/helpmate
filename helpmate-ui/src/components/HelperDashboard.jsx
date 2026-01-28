// src/components/dashboard/HelperDashboard.jsx (FINAL REVISED VERSION)

import React, { useState, useEffect } from 'react'; 
import TaskTabs from './TaskTabs';
import EnquiryCard from './EnquiryCard';
import ChatModal from './ChatModal'; 
// Ensure these paths are correct relative to HelperDashboard.jsx
import { acceptTask, getAvailableTasks } from '../services/taskClient'; 

const generateTempId = () => {
    return 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};

// --- Local Components (ActiveTaskCard and RegularTaskCard) ---

const ActiveTaskCard = ({ task, onStartChat, onComplete }) => (
    <div className={`active-task card-hover rounded-2xl p-6 shadow-sm ${task.type === 'regular' ? 'bg-emerald-50 border-emerald-300' : 'bg-orange-50 border-orange-300'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${task.type === 'regular' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
          <span className="text-2xl">{task.type === 'regular' ? '👷' : '💡'}</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Assigned: {task.time}</div>
          <div className={`text-lg font-bold ${task.type === 'regular' ? 'text-emerald-700' : 'text-orange-700'}`}>
              {task.type === 'regular' ? `₹${task.pay}` : `+${task.xp} XP`}
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
      <p className={`text-sm mb-4 ${task.type === 'regular' ? 'text-emerald-700' : 'text-orange-700'}`}>
          Status: In Progress • Requester: {task.requester.name}
      </p>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${task.type === 'regular' ? 'bg-emerald-200 text-emerald-900' : 'bg-orange-200 text-orange-900'}`}>
            {task.type === 'regular' ? 'Task Active' : 'Enquiry Active'}
        </span>
        <div className="flex space-x-2">
             <button 
                onClick={() => onStartChat(task)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white bg-blue-500 hover:bg-blue-600`}
            >
                Open Chat
            </button>
            <button 
                onClick={() => onComplete(task.id, task.type)} /* Completion handler */
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${task.type === 'regular' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}`}
            >
                Mark Complete
            </button>
        </div>
      </div>
    </div>
);


const RegularTaskCard = ({ task, isVerified, onAcceptTask, isAccepted, onViewDetails }) => (
    <div className="helper-task card-hover border border-gray-200 bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <span className="text-2xl">{task.icon || '📦'}</span>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-600">₹{task.pay}</div>
          <div className="text-sm text-gray-500">{task.time}</div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{task.desc}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">📍 {task.dist} km</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">⭐ {task.rating}</span>
        </div>
        
        <div className="flex space-x-2">
            {!isAccepted && (
                <button 
                    onClick={() => onViewDetails(task)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    Details
                </button>
            )}

            <button 
                onClick={() => onAcceptTask(task)} // Pass the full task object
                disabled={!isVerified || isAccepted} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors 
                    ${isAccepted 
                        ? 'bg-green-600 text-white cursor-default' 
                        : isVerified 
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
            >
                {isAccepted ? 'Task Accepted' : (isVerified ? 'Accept Task' : 'Verify to Accept')}
            </button>
        </div>
      </div>
    </div>
);


/**
 * Renders the Helper Mode Dashboard content.
 */
const HelperDashboard = ({ isVerified, onToast, onStartVerification, socket, currentUserId }) => { 
    const [activeTaskType, setActiveTaskType] = useState('enquiry'); 
    const [activeFilter, setActiveFilter] = useState('all'); 
    const [acceptedTasks, setAcceptedTasks] = useState([]); 
    const [regularTasks, setRegularTasks] = useState([]); 
    const [enquiryTasks, setEnquiryTasks] = useState([]); 
    const [myActiveTasks, setMyActiveTasks] = useState([]); 
    const [isLoading, setIsLoading] = useState(true); 
    const [showChatModal, setShowChatModal] = useState(false);
    const [currentChatData, setCurrentChatData] = useState(null);

    // --- useEffect for Fetching ALL Open Tasks (unchanged) ---
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                // Ensure this service returns task objects with an 'id' property
                const fetchedTasks = await getAvailableTasks(); 
                
                const dynamicRegular = fetchedTasks.filter(t => t.type === 'regular');
                const dynamicEnquiry = fetchedTasks.filter(t => t.type === 'enquiry').map(t => ({
                    ...t,
                    location: t.location_details || t.location, 
                    icon: '❓',
                }));

                setRegularTasks(dynamicRegular);
                setEnquiryTasks(dynamicEnquiry); 

            } catch (error) {
                console.error("Failed to fetch available tasks:", error);
                onToast(`Error loading tasks: ${error.message}`);
                setRegularTasks([]);
                setEnquiryTasks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [onToast]); 


    // --- Handlers ---

    const handleTaskCompleted = (taskId, type) => {
        setMyActiveTasks(prev => prev.filter(task => task.id !== taskId));
        onToast(`${type === 'regular' ? 'Task' : 'Enquiry'} completed! You earned ${type === 'regular' ? 'money' : 'XP'}.`);
    };
    
    const handleAcceptEnquiry = (task) => { 
        if (!isVerified) {
            onToast('Please complete verification to accept tasks');
            onStartVerification();
            return;
        }
        
        onToast(`Enquiry accepted: ${task.title}! Opening chat...`);
        
        // --- MOCK LOGIC: Use consistent mock assignment ID for chat testing ---
        const MOCK_ASSIGNMENT_ID = `MOCK_CHAT_ROOM_${task.id}`; 
        
        setEnquiryTasks(prev => prev.filter(t => t.id !== task.id)); 
        
        const acceptedTaskWithMockData = {
            id: generateTempId(),                       
            assignmentId: MOCK_ASSIGNMENT_ID, // CRITICAL: Consistent Mock ID
            taskId: task.id,                            
            ...task, 
            type: 'enquiry', 
            requester: { name: 'Requester A.', initial: 'R' }, 
            time: 'just now'
        };
        setMyActiveTasks(prev => [acceptedTaskWithMockData, ...prev]);

        handleStartChat(acceptedTaskWithMockData);
    };

    const handleViewDetails = (task) => {
        onToast(`Viewing details for task: ${task.title}. Full task modal coming soon!`);
    };

    const handleStartChat = (task) => {
        // Ensure the task object has the required chat IDs
        if (!task.taskId || !task.assignmentId) {
             return onToast("Error: Missing chat room details (Task/Assignment ID).");
        }
        
        const requesterData = task.requester || { name: 'Requester', initial: 'R' };
        
        // CRITICAL: Set the chat data with the required IDs for the Socket.IO handler
        setCurrentChatData({
            taskId: task.taskId,              
            assignmentId: task.assignmentId,  
            taskTitle: task.title,
            requesterName: requesterData.name,
            requesterInitial: requesterData.initial,
            messages: [], // Message array is empty, socket will load history
        });
        setShowChatModal(true);
    };

   // ✅ FINAL: Task acceptance with proper chat assignment linking
const handleAcceptTask = async (task) => {
    if (!isVerified) {
        onToast('Please complete verification to accept tasks');
        onStartVerification();
        return;
    }

    // Use task.id as the primary identifier (passed from the frontend data map)
    if (acceptedTasks.includes(task.id)) { // Check acceptedTasks against task.id
        onToast(`${task.title} is already accepted.`);
        return;
    }

    try {
        // 💾 Step 1: Call API to accept the task, using the frontend's standardized ID: task.id
        const result = await acceptTask(task.id); 

        // 💡 Step 2: Determine correct assignment ID
        const backendAssignmentId = result.assignment_id;
        const taskIdentifier = task.id; // Use task.id consistently
        const finalAssignmentId = backendAssignmentId || `MOCK_CHAT_ROOM_${taskIdentifier}`;

        // ✅ Step 3: Mark as accepted (prevents duplicate actions)
        setAcceptedTasks((prev) => [...prev, task.id]); // Store task.id

        // ✅ Step 4: Remove from available list
        setRegularTasks((prev) => prev.filter((t) => t.id !== task.id)); // Filter by task.id

        // ✅ Step 5: Create accepted task entry (for active task list)
        const acceptedTaskWithChatData = {
            ...task,
            id: finalAssignmentId, 
            assignmentId: String(finalAssignmentId), 
            taskId: taskIdentifier,
            status: 'assigned',
            type: 'regular',
            requester: {
                name: task.requester_name || 'Requester',
                initial: task.requester_initial || 'R',
            },
            time: new Date().toLocaleString(),
        };

        // Add to active list
        setMyActiveTasks((prev) => [acceptedTaskWithChatData, ...prev]);

        // ✅ Step 6: Notify user
        onToast(result.message || 'Task accepted successfully!');

        // ✅ Step 7: Open Chat Modal instantly
        handleStartChat(acceptedTaskWithChatData);

    } catch (error) {
        console.error('Error accepting task:', error);
        // The error message from the backend should provide specific context (e.g., 'Task not found')
        onToast(`Error accepting task: ${error.message || 'Failed to accept task.'}`);
    }
};

    const filteredRegularTasks = regularTasks.filter(task => 
        activeFilter === 'all' || task.category === activeFilter
    );

    return (
        <>
            <TaskTabs activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            
            {/* Task Type Toggle UI */}
            <div className="mb-6">
                <div className="flex items-center justify-center">
                    <div className="bg-gray-100 p-1 rounded-full flex items-center">
                        <button 
                            onClick={() => setActiveTaskType('enquiry')}
                            className={`category-toggle px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTaskType === 'enquiry' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
                        >
                            🎯 Enquiry Tasks
                        </button>
                        <button 
                            onClick={() => setActiveTaskType('regular')}
                            className={`category-toggle px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTaskType === 'regular' ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
                        >
                            💼 Regular Tasks
                        </button>
                    </div>
                </div>
            </div>
            
            {/* My Active Tasks Section */}
            {myActiveTasks.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-emerald-400">
                        <h3 className="text-xl font-bold text-emerald-800 mb-4">⭐ My Active Tasks ({myActiveTasks.length})</h3>
                        <p className="text-gray-600 text-sm mb-6">These are the tasks you have accepted and are currently working on.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myActiveTasks.map(task => (
                                <ActiveTaskCard 
                                    key={task.id} 
                                    task={task} 
                                    onStartChat={handleStartChat} 
                                    onComplete={handleTaskCompleted}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Dynamic Enquiry Task Section */}
            {activeTaskType === 'enquiry' && (
                <div className="mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">🎯 Quick Enquiry Tasks</h3>
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Earn XP Points!</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">Simple verification tasks that can be completed quickly for reward points</p>
                        
                        {isLoading && <p className="text-center text-gray-500">Loading enquiries...</p>}
                        
                        {!isLoading && enquiryTasks.length === 0 && (
                            <p className="text-center text-gray-500">No quick enquiry tasks available right now.</p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!isLoading && enquiryTasks.map((task) => (
                                <EnquiryCard 
                                    key={task.id} 
                                    task={task} 
                                    onAccept={() => handleAcceptEnquiry(task)} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Regular Task Section */}
            {activeTaskType === 'regular' && (
                <div className="mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">💼 Regular Tasks</h3>
                            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">Earn Money!</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-6">Complete tasks to earn money and build your reputation</p>
                        
                        {isLoading && <p className="text-center text-gray-500">Loading tasks...</p>}
                        
                        {!isLoading && filteredRegularTasks.length === 0 && (
                            <p className="text-center text-gray-500">No open tasks available right now. Check back later!</p>
                        )}
                        
                        <div className={!isVerified ? 'opacity-40' : ''}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {!isLoading && filteredRegularTasks.map(task => (
                                    <RegularTaskCard 
                                        key={task.id} 
                                        task={task} 
                                        isVerified={isVerified}
                                        onAcceptTask={handleAcceptTask}
                                        isAccepted={acceptedTasks.includes(task.id)} 
                                        onViewDetails={handleViewDetails}
                                    />
                                ))}
                            </div>
                        </div>
                        {!isVerified && <p className="text-center text-red-500 mt-4 font-semibold">Verification needed to accept tasks! <button onClick={onStartVerification} className="text-blue-500 underline">Start Verification</button></p>}
                    </div>
                </div>
            )}
            
            {/* Chat Modal */}
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

export default HelperDashboard;