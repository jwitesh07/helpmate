import React from 'react'; // MUST KEEP THIS IMPORT

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short' };
    return date.toLocaleDateString('en-US', options);
};

// Map values from database keys to display labels
const GENDER_MAP = {
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
    'prefer-not-to-say': 'Prefer not to say'
};

const ProfileDropdown = ({ 
    userData, 
    isVerified, 
    onLogout, 
    onStartVerification, 
    onToast,
}) => {
    // FIX: Using React.useState instead of destructured useState
    const [isOpen, setIsOpen] = React.useState(false); 
    
    // FIX: Using React.useEffect
    React.useEffect(() => {
        // Function to close dropdown when clicking outside is typically handled here
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('profileDropdown');
            const profileBtn = document.getElementById('profileBtn');

            if (dropdown && profileBtn && !profileBtn.contains(event.target) && !dropdown.contains(event.target) && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]); // Only rerun when isOpen state changes

    
    // Safety check: ensure userData is available
    if (!userData) {
        return (
            <div className="relative">
                <button 
                    className="flex items-center space-x-2"
                    onClick={() => onToast("Profile data not loaded yet.")}
                >
                    <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                </button>
            </div>
        );
    }
    
    // Destructure required fields
    const { firstName, lastName, mobile, email, age, gender, city, registeredAt } = userData;
    const fullName = `${firstName} ${lastName}`;
    const avatarInitial = firstName.charAt(0).toUpperCase();

    // Verification Status JSX
    const VerificationStatus = () => (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {isVerified ? (
                <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    Verified
                </>
            ) : (
                <>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                    Pending Verification
                </>
            )}
        </div>
    );
    
    const handleVerificationClick = () => {
        if (!isVerified) {
            onStartVerification(); // Triggers the modal open in App.jsx
            setIsOpen(false);
        } else {
            onToast("You are already fully verified!");
        }
    };

    return (
        <div className="relative">
            {/* Profile Button (Header Display) */}
            <button 
                id="profileBtn" 
                className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-semibold text-sm">
                    {avatarInitial}
                </div>
                <span className="text-sm font-medium text-gray-700">{firstName}</span>
                <svg className="w-4 h-4 text-gray-400 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button> 

            {/* Profile Dropdown Content */}
            {isOpen && (
                <div 
                    id="profileDropdown" 
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
                >
                    {/* Profile Header */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                            <div id="dropdownAvatar" className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                                {avatarInitial}
                            </div>
                            <div className="flex-1">
                                <h3 id="dropdownName" className="font-semibold text-gray-900">{fullName}</h3>
                                <p id="dropdownMobile" className="text-sm text-gray-600">+91 {mobile}</p>
                                <VerificationStatus />
                            </div>
                        </div>
                    </div>
                    
                    {/* Profile Details */}
                    <div className="p-4 border-b border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Information</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Email:</span> <span id="dropdownEmail" className="text-gray-900">{email}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Age:</span> <span id="dropdownAge" className="text-gray-900">{age} years</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Gender:</span> <span id="dropdownGender" className="text-gray-900">{GENDER_MAP[gender] || gender}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">City:</span> <span id="dropdownCity" className="text-gray-900">{city}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Member since:</span> <span id="dropdownJoinDate" className="text-gray-900">{formatDate(registeredAt)}</span></div>
                        </div>
                    </div>
                    
                    {/* Quick Stats (Static in this simplified component) */}
                    <div className="p-4 border-b border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-lg font-bold text-emerald-600">47</div>
                                <div className="text-gray-600">Tasks Completed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-yellow-500">4.9 ⭐</div>
                                <div className="text-gray-600">Rating</div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Menu Options */}
                    <div className="p-2">
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                           <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Edit Profile 
                        </button> 
                        <button 
                            onClick={handleVerificationClick}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> {isVerified ? 'View Verification Status' : 'Complete Verification'}
                        </button>
                        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z"/> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> Settings 
                        </button>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <button onClick={onLogout} className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg> Logout 
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Logic to close dropdown when clicking outside */}
            <div 
                className={`fixed inset-0 z-40 ${isOpen ? '' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>
        </div>
    );
};

export default ProfileDropdown;
