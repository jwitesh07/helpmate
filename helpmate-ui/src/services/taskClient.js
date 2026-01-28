// src/services/taskClient.js (FINAL FIX FOR MOCK ID VALIDATION)

const BASE_URL = "http://localhost:3000/api/v1/user";
import { io } from "socket.io-client"; 

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error("Authentication token not found. Please log in.");
    }
    return { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        const errorMessage = data.message || 'An unknown error occurred';
        throw new Error(errorMessage);
    }
    return data;
};

export const postTask = async (taskData) => {
    const response = await fetch(`${BASE_URL}/task`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
    });
    return handleResponse(response);
};

export const acceptTask = async (taskId) => {
    const response = await fetch(`${BASE_URL}/accept/${taskId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};

export const getAvailableTasks = async () => {
    const response = await fetch(`${BASE_URL}/tasks/available`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const result = await handleResponse(response);
    return result.data.tasks || []; 
};

// --- Get Tasks Posted by Requester Dashboard (CRITICAL UPDATE) ---
export const getRequestedTasks = async () => {
    const response = await fetch(`${BASE_URL}/tasks/requested`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    const result = await handleResponse(response);
    
    // 💥 FIX: Validate the Task ID before creating the mock string.
    const tasks = (result.data.tasks || []).map(task => {
        const isAssigned = task.status === 'assigned' || task.status === 'in_progress';
        
        // Use task.task_id first, then fall back to task.id if task_id is missing.
        const validTaskId = task.task_id || task.id; 
        
        // If assigned, missing the real ID, AND we have a fallback ID, inject the mock.
        if (isAssigned && !task.assignment_id && validTaskId) { 
            return {
                ...task,
                assignment_id: `MOCK_CHAT_ROOM_${validTaskId}`, 
            };
        }
        return task;
    });

    return tasks; 
};


// ----------------------------------------------------------------------
// --- Socket.IO Client Configuration for Chat (EXISTING) ---
// ----------------------------------------------------------------------

export const initSocket = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error("Cannot initialize socket: Auth token missing.");
        return null;
    }
    
    const socket = io("http://localhost:3000", {
        auth: {
            token: token
        },
        autoConnect: true 
    });
    
    socket.on('connect', () => {
        console.log("Socket connected successfully:", socket.id);
    });
    
    socket.on('connect_error', (err) => {
        console.error("Socket Connection Error:", err.message);
    });
    
    return socket;
};