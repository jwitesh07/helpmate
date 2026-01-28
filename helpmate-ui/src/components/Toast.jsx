// src/components/Toast.jsx

import React from 'react';

/**
 * Global success toast notification component.
 * @param {object} props
 * @param {object} props.toast - { message: string, visible: boolean }
 */
const Toast = ({ toast }) => {
    return (
        <div 
            id="successToast" 
            className={`fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform z-50 ${toast.visible ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                <span id="toastMessage">{toast.message}</span>
            </div>
        </div>
    );
};

export default Toast;