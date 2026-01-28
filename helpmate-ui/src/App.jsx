// src/App.jsx

import React, { useState, useEffect, useRef } from 'react'; 

// NOTE: All component imports are assumed to be in the same path structure.
// If your file structure differs (e.g., components is in a sibling folder, not a direct child), 
// you may need to adjust these paths, but the standard resolution is below:
import Header from './components/Header';
import VerificationModal from './components/VerificationModal'; 
import MobileOTPFlow from './components/MobileOTPFlow'; 
import WelcomeBanner from './components/WelcomeBanner';
import HelperDashboard from './components/HelperDashboard';
import RequesterDashboard from './components/RequesterDashboard';
import Toast from './components/Toast'; 
// Ensure the path to the service file is correct
import { initSocket } from './services/taskClient'; 

// --- STATIC DATA DEFINITIONS (Reduced to only essential config/stats) ---

const INITIAL_HELPER_STATS = { number1: 12, label1: 'Tasks Completed', number2: '₹3,400', label2: 'Earned This Month', number3: 4.9, label3: 'Rating', };
const INITIAL_REQUESTER_STATS = { number1: 8, label1: 'Tasks Posted', number2: 5, label2: 'Active Tasks', number3: 2, label3: 'Completed Today', };


// --- MAIN APP COMPONENT ---

const App = () => {
    // --- Authentication & Flow State ---
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [isVerified, setIsVerified] = useState(false); 
    const [showModal, setShowModal] = useState(false); 
    const [toast, setToast] = useState({ message: '', visible: false });

    // --- Dashboard State ---
    const [currentMode, setCurrentMode] = useState('helper'); 
    const [wallet] = useState({ balance: '₹1,255', xp: 850 });
    
    // Mock user data (for ProfileDropdown and WelcomeBanner)
    const [userData] = useState({ 
        firstName: 'JD', 
        lastName: 'Doe', 
        mobile: '9876543210', 
        email: 'jd@example.com', 
        age: 30, 
        gender: 'male', 
        city: 'bangalore', 
        registeredAt: new Date().toISOString(),
        user_id: 123 // Use a numeric or string ID that matches your backend user_id type
    });
    
    // --- NEW: Socket State & User ID ---
    const socketRef = useRef(null); 
    // CRITICAL: This MUST be the actual user ID from the DB/JWT payload
    // Using a mock ID for now, but in a real app, this would be dynamically set on login.
    const [currentUserId, setCurrentUserId] = useState(userData.user_id); 


    // --- NEW: Socket Initialization Effect ---
    useEffect(() => {
        if (isLoggedIn && !socketRef.current) {
            const socket = initSocket();
            
            if (socket) {
                socketRef.current = socket;
            }
            
            // Cleanup function: disconnect the socket when the component unmounts or logs out
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }
    }, [isLoggedIn]); // Re-run only when login state changes


    // --- Toast & Flow Handlers ---
    const showSuccessToast = (message) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
    };

    const handleLogout = () => {
        showSuccessToast('Logged out successfully!');
        setIsLoggedIn(false);
        setIsVerified(false); 
        // Disconnect socket immediately on logout
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    const handleLoginSuccess = (userId) => {
        showSuccessToast('Login successful! Welcome to HelpMate.');
        setIsLoggedIn(true);
        setIsVerified(false); 
        // Set the actual userId here from the login response
        setCurrentUserId(userId); 
        setShowModal(true); // Auto-show verification modal
    };

    const handleVerificationComplete = () => {
        showSuccessToast('Verification submitted! You now have full access.');
        setIsVerified(true);
        setShowModal(false);
    };
    
    // NEW HELPER FUNCTION to start verification 
    const handleStartVerification = () => {
        setShowModal(true);
    }
    
    // --- Dashboard Logic Helpers ---
    const isHelper = currentMode === 'helper';
    const stats = isHelper ? INITIAL_HELPER_STATS : INITIAL_REQUESTER_STATS;
    const userName = userData ? userData.firstName : 'User';

    // --- Conditional Rendering ---
    let mainContent;

    if (!isLoggedIn) {
        // RENDER 1: Mobile OTP Login Flow
        mainContent = <MobileOTPFlow onLoginSuccess={handleLoginSuccess} onToast={showSuccessToast} />;
    } else {
        // RENDER 2: Dashboard View
        mainContent = (
            <>
                <Header 
                    currentMode={currentMode} 
                    setMode={setCurrentMode} 
                    wallet={wallet} 
                    onLogout={handleLogout}
                    isVerified={isVerified} 
                    onStartVerification={handleStartVerification}
                    onToast={showSuccessToast} 
                />

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    
                    {/* VERIFICATION BANNER */}
                    {!isVerified && (
                        <div id="verificationBanner" className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-amber-800 mb-2">Complete Your Verification</h3>
                                        <p className="text-amber-700 mb-4">To post tasks or accept help requests, please complete your document verification.</p>
                                        <div className="flex items-center space-x-4">
                                            <button onClick={handleStartVerification} className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium"> Start Verification </button> 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <WelcomeBanner 
                        isHelper={isHelper} 
                        stats={stats} 
                        userName={userName}
                    />

                    {/* --- Mode-Specific Dashboards (PASSING SOCKET & USER ID) --- */}
                    {isHelper 
                        ? <HelperDashboard 
                            isVerified={isVerified} 
                            onToast={showSuccessToast} 
                            onStartVerification={handleStartVerification} 
                            socket={socketRef.current} // <-- CRITICAL: Pass the active socket instance
                            currentUserId={currentUserId} // <-- CRITICAL: Pass the current user's ID
                          />
                        : <RequesterDashboard 
                            isVerified={isVerified} 
                            onToast={showSuccessToast} 
                            socket={socketRef.current} // <-- CRITICAL: Pass the active socket instance
                            currentUserId={currentUserId} // <-- CRITICAL: Pass the current user's ID
                          />
                    }
                </main>
            </>
        );
    }

    return (
        <div className="h-full bg-gray-50">
            {/* Renders LoginForm or Dashboard (mainContent) */}
            {mainContent}

            {/* Verification Modal */}
            <VerificationModal 
                show={showModal}
                onClose={() => setShowModal(false)}
                onVerificationSuccess={handleVerificationComplete}
                onToast={showSuccessToast}
            />

            {/* Success Toast */}
            <Toast toast={toast} />
        </div>
    );
};

export default App;
