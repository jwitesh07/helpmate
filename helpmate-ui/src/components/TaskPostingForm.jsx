// src/components/TaskPostingForm.jsx

import React, { useState } from 'react';
// NEW IMPORT: Import the task posting API client
import { postTask } from '../services/taskClient'; 

/**
 * Renders the consolidated form for a Requester to post tasks or enquiries.
 * @param {object} props
 * @param {boolean} props.isVerified - User verification status.
 * @param {function} props.onPostSuccess - Callback to show a success toast and switch view.
 */
const TaskPostingForm = ({ isVerified, onPostSuccess }) => {
    // State to toggle between Quick Enquiry and Regular Task modes
    const [taskType, setTaskType] = useState('regular'); // 'regular' or 'enquiry'
    // State to manage loading state during API call
    const [isLoading, setIsLoading] = useState(false); 

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isVerified) {
            onPostSuccess('Verification needed to post tasks or enquiries.', true);
            return;
        }

        setIsLoading(true);
        const form = e.target;
        let payload = {};

        try {
            // 1. Gather common fields
            const commonFields = {
                type: taskType,
                location: form.taskLocation.value, // Maps to location_details in DB
            };

            // 2. Gather type-specific fields
            if (taskType === 'regular') {
                payload = {
                    ...commonFields,
                    title: form.taskTitle.value,
                    description: form.taskDescription.value,
                    category: form.taskCategory.value,
                    budget: parseFloat(form.taskBudget.value), // Ensure budget is a number
                    reward_xp: null // Set to null for DB consistency
                };
            } else { // 'enquiry'
                // For simplicity, we assume enquiryTitle/Description covers all details
                payload = {
                    ...commonFields,
                    title: form.enquiryTitle.value,
                    description: form.enquiryDescription.value,
                    category: null, // Set to null for DB consistency
                    budget: null,    // Set to null for DB consistency
                    reward_xp: parseInt(form.enquiryXP.value, 10), // Ensure XP is an integer
                };
            }
            
            // 3. API Call
            const result = await postTask(payload);
            
            // 4. Success handling
            onPostSuccess(result.message, false);

        } catch (error) {
            // 5. Error handling (e.g., failed validation, network error)
            onPostSuccess(error.message || "Failed to post request. Please check the form data.", true);
        } finally {
            setIsLoading(false);
        }
        
        // Note: We don't call e.target.reset() on success here, as the parent component (RequesterDashboard)
        // navigates away from the form view via the onPostSuccess callback.
    };
    
    // --- JSX for Quick Enquiry Form ---
    const EnquiryForm = () => (
        <>
            <div>
                <label htmlFor="enquiryTitle" className="block text-sm font-medium text-gray-700 mb-2">Enquiry Title</label>
                <input id="enquiryTitle" name="enquiryTitle" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g., Check store hours, Confirm parking availability" />
            </div>
            
            {/* Note: enquiryLocation removed here as it's consolidated into the common taskLocation field below */}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="enquiryXP" className="block text-sm font-medium text-gray-700 mb-2">XP Reward (Helper earns)</label>
                    <input id="enquiryXP" name="enquiryXP" type="number" min="10" defaultValue="25" required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
                <div>
                    <label htmlFor="enquiryTime" className="block text-sm font-medium text-gray-700 mb-2">Estimated Time</label>
                    <input id="enquiryTime" type="text" defaultValue="< 10 mins" required className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" readOnly />
                </div>
            </div>

            <div>
                <label htmlFor="enquiryDescription" className="block text-sm font-medium text-gray-700 mb-2">Detailed Instructions</label>
                <textarea id="enquiryDescription" name="enquiryDescription" rows="3" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Provide clear steps for the helper..."></textarea>
            </div>
        </>
    );

    // --- JSX for Regular Task Form (Simplified from your original) ---
    const RegularTaskForm = () => (
        <>
            <div>
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                <input id="taskTitle" name="taskTitle" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="e.g., Grocery delivery, House cleaning" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="taskCategory" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select id="taskCategory" name="taskCategory" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Select category</option>
                        <option value="delivery">🚚 Delivery</option>
                        <option value="cleaning">🧹 Cleaning</option>
                        <option value="tech">💻 Tech Help</option>
                        <option value="moving">📦 Moving</option>
                        <option value="other">🔧 Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="taskBudget" className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                    <input id="taskBudget" name="taskBudget" type="number" min="50" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter amount" />
                </div>
            </div>

            <div>
                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea id="taskDescription" name="taskDescription" rows="4" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Provide detailed information..."></textarea>
            </div>
        </>
    );


    return (
        <div className="p-8">
            <div className={`max-w-2xl mx-auto ${!isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {taskType === 'regular' ? '💼' : '🎯'}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Post a New {taskType === 'regular' ? 'Task' : 'Enquiry'}</h3>
                    <p className="text-gray-600">
                        {taskType === 'regular' ? 
                            'Describe what you need help with and connect with paid helpers.' : 
                            'Need quick, simple verification? Post an Enquiry for XP points.'
                        }
                    </p>
                </div>
                
                {/* Task Type Toggle */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 p-1 rounded-full flex items-center">
                        <button 
                            type="button" // Use type="button" to prevent form submission
                            onClick={() => setTaskType('regular')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${taskType === 'regular' ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
                            disabled={isLoading}
                        >
                            💼 Regular Task (Paid)
                        </button>
                        <button 
                            type="button" // Use type="button" to prevent form submission
                            onClick={() => setTaskType('enquiry')}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${taskType === 'enquiry' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
                            disabled={isLoading}
                        >
                            🎯 Quick Enquiry (XP)
                        </button>
                    </div>
                </div>

                <form id="postTaskForm" className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Render the appropriate form based on state */}
                    {taskType === 'regular' ? <RegularTaskForm /> : <EnquiryForm />}
                    
                    {/* Common Fields */}
                    <div>
                        <label htmlFor="taskLocation" className="block text-sm font-medium text-gray-700 mb-2">Location/Address</label>
                        <input id="taskLocation" name="taskLocation" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter your location or address" />
                    </div>

                    <div className="flex items-center">
                        <input id="agreeToTerms" type="checkbox" required className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded" />
                        <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                            I agree to the platform terms and conditions.
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full py-3 px-4 rounded-md transition-colors font-medium ${
                            isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                    >
                        {isLoading ? 'Posting...' : `Post ${taskType === 'regular' ? 'Task' : 'Enquiry'} & Find Helpers`}
                    </button>
                </form>
            </div>
            {!isVerified && <p className="text-center text-red-500 mt-4 font-semibold">Verification needed to post new requests!</p>}
        </div>
    );
};

export default TaskPostingForm;