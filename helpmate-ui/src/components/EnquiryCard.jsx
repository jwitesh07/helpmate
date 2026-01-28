// src/components/EnquiryCard.jsx

import React from 'react';

// Assuming you'll pass an onAccept function from App.jsx
const EnquiryCard = ({ task, onAccept }) => {
  const handleAccept = () => {
    if (onAccept) {
      onAccept(task.xp); // Example: update XP in parent state
    }
  };

  return (
    <div className="enquiry-card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 card-hover">
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
                <span className="text-2xl">{task.icon}</span>
                <div>
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.location || 'Location Info'}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-lg font-bold text-orange-600">+{task.xp} XP</div>
                <div className="text-xs text-gray-500">~{task.time || 5} mins</div>
            </div>
        </div>
        <p className="text-sm text-gray-700 mb-3">{task.desc || task.title}</p>
        <div className="flex items-center justify-between">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">📍 {task.distance || 0.5} km away</span>
            <button 
              onClick={handleAccept} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors enquiry-btn"
            >
                Accept & Go
            </button>
        </div>
    </div>
  );
};

export default EnquiryCard;