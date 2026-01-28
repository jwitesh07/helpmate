import React, { useState, useEffect } from 'react'; // ADDED: useState and useEffect
import ProfileDropdown from './ProfileDropdown'; 
// ADDED: Import service functions for data fetching and logout
import { fetchUserProfile, logoutUser } from '../services/authClient'; 

// CRITICAL: REMOVED userData, isVerified, onLogout, onToast, onStartVerification from props.
const Header = ({ 
  currentMode, 
  setMode, 
  wallet, 
}) => {
  // --- Profile State Management (Internal) ---
  const [userData, setUserData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null); // Used for simple toast feedback
  
  const isHelper = currentMode === 'helper';

  // --- Handlers (Internal) ---

  const handleToast = (message) => {
      setToastMessage(message);
      console.log("TOAST:", message);
      // Logic to clear the toast after a few seconds
      setTimeout(() => setToastMessage(null), 3000); 
  };

  const handleLogout = () => {
      logoutUser(); // Calls the function to clear the token in authClient.js
      handleToast("Successfully logged out.");
      // TODO: Add navigation logic to redirect to the login page
      // e.g., router.push('/login');
  };

  const handleStartVerification = () => {
      handleToast("Verification workflow started.");
      // TODO: Add logic to open the global verification modal/form
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
      const loadUserProfile = async () => {
          setIsLoading(true);
          try {
              const response = await fetchUserProfile();
              // Access the nested user object
              const backendUser = response.data.user;

              // ⭐️ DATA MAPPING WITH REGISTEREDAT FALLBACK FIX ⭐️
              const mappedUserData = {
                  firstName: backendUser.first_name,
                  lastName: backendUser.last_name,
                  mobile: backendUser.phone_number, 
                  email: backendUser.email,
                  age: backendUser.age,
                  gender: backendUser.gender,
                  city: backendUser.city,
                  // FIX: Provide a default date (current date) if backendUser.created_at is null/undefined.
                  registeredAt: backendUser.created_at || new Date().toISOString(), 
              };
              
              // Only set data if mapping was successful
              setUserData(mappedUserData);
              
              // ⭐️ FIX APPLIED HERE: Use is_registered for 'Verified' status ⭐️
              // This correctly links the 'Verified' badge to the completion of registration (Step 3).
              setIsVerified(backendUser.is_registered === 1); 

          } catch (error) {
              console.error("Failed to load user profile:", error.message);
              // Show toast error, but ensure userData is explicitly set to null on failure
              handleToast("Profile load failed. Please check your session.");
              setUserData(null);
          } finally {
              setIsLoading(false);
          }
      };

      loadUserProfile();
  }, []); // Run only once on mount
  
  // --- Helper Icon Component (No change) ---
  const HelperIcon = () => (
    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main helping hand */}
      <path d="M12 2C13.1 2 14 2.9 14 4V8L15.5 6.5C16.3 5.7 17.7 5.7 18.5 6.5C19.3 7.3 19.3 8.7 18.5 9.5L16 12H20C21.1 12 22 12.9 22 14C22 15.1 21.1 16 20 16H16L18.5 18.5C19.3 19.3 19.3 20.7 18.5 21.5C17.7 22.3 16.3 22.3 15.5 21.5L12 18V22C12 23.1 11.1 24 10 24C8.9 24 8 23.1 8 22V18L4.5 21.5C3.7 22.3 2.3 22.3 1.5 21.5C0.7 20.7 0.7 19.3 1.5 18.5L4 16H0C-1.1 16 -2 15.1 -2 14C-2 12.9 -1.1 12 0 12H4L1.5 9.5C0.7 8.7 0.7 7.3 1.5 6.5C2.3 5.7 3.7 5.7 4.5 6.5L8 10V4C8 2.9 8.9 2 10 2H12Z" fill="currentColor" transform="translate(2,0) scale(0.8)"/>
      {/* Heart accent */}
      <circle cx="18" cy="6" r="2" fill="#ff6b6b" opacity="0.9"/>
      <path d="M17.5 5.5C17.5 5.2 17.7 5 18 5C18.3 5 18.5 5.2 18.5 5.5C18.5 6.1 18.1 6.5 17.5 6.5C17.2 6.5 17 6.3 17 6C17 5.7 17.2 5.5 17.5 5.5Z" fill="white"/>
    </svg>
  );

  // --- Render ---
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* ADDED: Global Toast Notification Display */}
      {toastMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 p-3 bg-blue-600 text-white text-sm rounded-lg shadow-xl z-[999]">
              {toastMessage}
          </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            {/* ... (Logo content remains the same) ... */}
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <HelperIcon />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-2xl opacity-20 blur-sm"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">HelpMate</h1>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>📍 Koramangala, Bangalore</span>
              </div>
            </div>
          </div>
          
          {/* Mode Toggle & Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Mode Toggle (No change) */}
            <div className="bg-gray-100 p-1 rounded-full flex items-center">
              <button 
                onClick={() => setMode('helper')}
                className={`toggle-switch px-4 py-2 rounded-full text-sm font-medium transition-all ${isHelper ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
              >
                🛠️ Helper Mode
              </button>
              <button 
                onClick={() => setMode('requester')}
                className={`toggle-switch px-4 py-2 rounded-full text-sm font-medium transition-all ${!isHelper ? 'bg-emerald-500 text-white' : 'text-gray-600'}`}
              >
                📝 Requester Mode
              </button>
            </div>
            
            {/* Wallet (No change) */}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2 rounded-lg cursor-pointer hover:shadow-lg transition-all">
              <span className="text-lg">💰</span>
              <div className="text-sm">
                <div className="font-semibold">{wallet.balance}</div>
                <div className="text-xs opacity-80">{wallet.xp} XP</div>
              </div>
            </div>
            
            {/* Notifications (No change) */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center notification-pulse">3</span>
              </button>
            </div>
            
            {/* Profile Dropdown: Use internal state and handlers */}
            {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : (
                <ProfileDropdown 
                    // Pass internal state variables
                    userData={userData} 
                    isVerified={isVerified}
                    // Pass internal handler functions
                    onLogout={handleLogout}
                    onToast={handleToast}
                    onStartVerification={handleStartVerification}
                />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
