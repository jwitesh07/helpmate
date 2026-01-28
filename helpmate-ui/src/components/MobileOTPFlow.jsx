import React, { useState, useEffect } from 'react';
import * as authClient from '../services/authClient'; // <-- IMPORTANT: Ensure this path is correct

// --- Placeholder for the Logo Icon ---
const LogoIcon = () => (
    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C13.1 2 14 2.9 14 4V8L15.5 6.5C16.3 5.7 17.7 5.7 18.5 6.5C19.3 7.3 19.3 8.7 18.5 9.5L16 12H20C21.1 12 22 12.9 22 14C22 15.1 21.1 16 20 16H16L18.5 18.5C19.3 19.3 19.3 20.7 18.5 21.5C17.7 22.3 16.3 22.3 15.5 21.5L12 18V22C12 23.1 11.1 24 10 24C8.9 24 8 23.1 8 22V18L4.5 21.5C3.7 22.3 2.3 22.3 1.5 21.5C0.7 20.7 0.7 19.3 1.5 18.5L4 16H0C-1.1 16 -2 15.1 -2 14C-2 12.9 -1.1 12 0 12H4L1.5 9.5C0.7 8.7 0.7 7.3 1.5 6.5C2.3 5.7 3.7 5.7 4.5 6.5L8 10V4C8 2.9 8.9 2 10 2H12Z" fill="currentColor" transform="translate(2,0) scale(0.8)"/>
      {/* Heart accent */}
      <circle cx="18" cy="6" r="2" fill="#ff6b6b" opacity="0.9"/>
      <path d="M17.5 5.5C17.5 5.2 17.7 5 18 5C18.3 5 18.5 5.2 18.5 5.5C18.5 6.1 18.1 6.5 17.5 6.5C17.2 6.5 17 6.3 17 6C17 5.7 17.2 5.5 17.5 5.5Z" fill="white"/>
    </svg>
);

const MobileOTPFlow = ({ onLoginSuccess, onToast }) => {
    const [step, setStep] = useState('mobile'); // 'mobile', 'otp', 'details'
    const [phoneNumber, setPhoneNumber] = useState(''); // Stores E.164 (+91...) for display
    const [rawPhoneNumber, setRawPhoneNumber] = useState(''); // Stores 10-digit number for API
    const [backendUserId, setBackendUserId] = useState(null); // Stores ID from backend /login
    const [otpCode, setOtpCode] = useState(Array(4).fill(''));
    const [resendTimer, setResendTimer] = useState(0);

    // Timer Logic
    useEffect(() => {
        let timer;
        if (resendTimer > 0 && step === 'otp') {
            timer = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendTimer, step]);
    
    // --- Handlers ---
    
// 1. Mobile Form Submission (Sends OTP)
    const handleMobileSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const numberInput = document.getElementById('mobileNumber');
        // Use rawPhoneNumber from state if resending, otherwise use input value
        const rawNumber = numberInput ? numberInput.value.replace(/\D/g, '') : rawPhoneNumber; 
        
        if (rawNumber.length !== 10) {
            onToast('Please enter a valid 10-digit mobile number');
            return;
        }

        setRawPhoneNumber(rawNumber);
        setPhoneNumber(`+91${rawNumber}`); // E.164 Format for display
        
        try {
            // --- ACTUAL API CALL: Send OTP ---
            const result = await authClient.sendOtp(rawNumber); 
            
            setBackendUserId(result.user_id); // Crucial: Store the user_id
            onToast(result.message);
            setStep('otp');
            // 💡 CHANGE HERE: Update the timer value from 30 to 60
            setResendTimer(60); // Changed from 30 to 60
            
        } catch (error) {
            onToast(`Failed to send OTP: ${error.message}`);
        }
    };

    // 2. OTP Verification
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const code = otpCode.join('');

        if (code.length !== 4) {
            onToast('Please enter complete 4-digit OTP');
            return;
        }

        if (!rawPhoneNumber) {
            onToast('System Error: Phone number is missing. Please restart.');
            return;
        }

        try {
            // --- ACTUAL API CALL: Verify OTP ---
            const result = await authClient.verifyOtp(rawPhoneNumber, code); 
            
            onToast(result.message);
            
            if (result.is_new_user) {
                // New user: must complete registration details
                onToast('OTP verified. Please complete your profile details.');
                setStep('details');
            } else {
                // Existing user: logged in successfully
                if (result.token) {
                    // 🚀 FIX 1: SAVE THE TOKEN UPON SUCCESSFUL LOGIN 🚀
                    localStorage.setItem('authToken', result.token);
                    
                    // ⭐️ IMPROVEMENT: Call onLoginSuccess directly after saving the token ⭐️
                    onToast('Welcome back! Logging in...');
                    onLoginSuccess();
                } else {
                    // Should not happen if backend is correct, but handles missing token case
                    onToast('Login failed: Token not received from server.');
                }
            }
        } catch (error) {
            onToast(`Verification failed: ${error.message}`);
        }
    };

    // 3. User Details Submission (Final registration)
    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        
        const profileData = {
            firstName: e.target.userFirstName.value,
            lastName: e.target.userLastName.value,
            email: e.target.userEmail.value,
            gender: e.target.userGender.value,
            age: e.target.userAge.value,
            city: e.target.userCity.value,
        };

        if (parseInt(profileData.age) < 18) { onToast('Age must be 18 or older.'); return; }
        
        if (!backendUserId) {
            onToast('System Error: Cannot complete registration without user ID.');
            return;
        }

        try {
            // --- FINAL API CALL: Complete Registration ---
            const result = await authClient.completeRegistration(backendUserId, profileData); 
            
            onToast(result.message);
            
            if (result.token) {
                // 🚀 FIX 2: SAVE THE TOKEN AFTER SUCCESSFUL REGISTRATION 🚀
                localStorage.setItem('authToken', result.token);
                
                // ⭐️ IMPROVEMENT: Call onLoginSuccess directly after saving the token ⭐️
                onLoginSuccess(); 
            } else {
                onToast('Registration failed: Token not received from server.');
            }

        } catch (error) {
            onToast(`Registration Failed: ${error.message}`);
        }
    };

    // OTP Input Focus Handler
    const handleOtpChange = (index, value) => {
        const char = value.replace(/\D/g, '').slice(0, 1);
        const newOtp = [...otpCode];
        newOtp[index] = char;
        setOtpCode(newOtp);

        // Auto-focus next input
        if (char && index < 3) {
            document.querySelector(`.otp-input[data-index="${index + 1}"]`).focus();
        } else if (!char && index > 0 && value === '') {
            // Auto-focus previous input on backspace if the current field is empty
            document.querySelector(`.otp-input[data-index="${index - 1}"]`).focus();
        }
    };
    
    // ----------------------------------------------------
    // Renderers (UI remains the same)
    // ----------------------------------------------------
    
    // --- Step 1: Mobile Number Entry ---
    if (step === 'mobile') {
        return (
            <div id="mobileStep" className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <LogoIcon />
                  </div>
                  <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Welcome to HelpMate</h2>
                  <p className="mt-2 text-sm text-gray-600">Your trusted task companion platform</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">📱</div>
                        <h3 className="text-xl font-semibold text-gray-900">Enter your mobile number</h3>
                        <p className="text-gray-600 mt-2">We'll send you an OTP to verify</p>
                    </div>
                    <form onSubmit={handleMobileSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                            <div className="flex">
                                <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50"><span className="text-gray-600 font-medium">🇮🇳 +91</span></div>
                                <input id="mobileNumber" name="mobileNumber" type="tel" maxLength="10" pattern="[0-9]{10}" required className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter 10-digit mobile number"/>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter your 10-digit mobile number without country code</p>
                        </div>
                        <button type="submit" className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors font-medium"> Send OTP </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">By continuing, you agree to our <a href="#" className="text-emerald-600 hover:text-emerald-500">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:text-emerald-500">Privacy Policy</a></p>
                    </div>
                </div>
              </div>
            </div>
        );
    }
    
    // --- Step 2: OTP Verification ---
    if (step === 'otp') {
        return (
            <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <LogoIcon />
                  </div>
                  <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Verify Your Access</h2>
                </div>
                <div id="otpStep" className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">🔐</div>
                        <h3 className="text-xl font-semibold text-gray-900">Verify OTP</h3>
                        <p className="text-gray-600 mt-2">Enter the 4-digit code sent to <span id="displayMobile" className="font-semibold">{phoneNumber}</span></p>
                    </div>
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                            <div className="flex justify-center space-x-2">
                                {otpCode.map((digit, index) => (
                                    <input 
                                        key={index}
                                        type="text" 
                                        maxLength="1" 
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        onKeyDown={(e) => { 
                                            // Handle backspace logic 
                                            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                                document.querySelector(`.otp-input[data-index="${index - 1}"]`).focus(); 
                                            }
                                        }}
                                        className="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" 
                                        data-index={index}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                            <button 
                                type="button" 
                                id="resendOtp" 
                                onClick={handleMobileSubmit} // Resend function
                                className={`font-medium text-sm ${resendTimer > 0 ? 'text-gray-500' : 'text-emerald-600 hover:text-emerald-500'}`}
                                disabled={resendTimer > 0}
                            > 
                                {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : 'Resend OTP'}
                            </button>
                        </div>
                        <div className="flex space-x-4">
                            <button type="button" onClick={() => setStep('mobile')} className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium"> Back </button> 
                            <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors font-medium"> Verify OTP </button>
                        </div>
                    </form>
                </div>
              </div>
            </div>
        );
    }
    
    // --- Step 3: User Details (New Users Only) ---
    if (step === 'details') {
        return (
            <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <LogoIcon />
                  </div>
                  <h2 className="mt-6 text-3xl font-bold text-gray-800">Final Step</h2>
                </div>
                <div id="userDetailsStep" className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">👤</div>
                        <h3 className="text-xl font-semibold text-gray-900">Complete your profile</h3>
                        <p className="text-gray-600 mt-2">Help us know you better</p>
                    </div>
                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label htmlFor="userFirstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label> <input id="userFirstName" name="userFirstName" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter first name"/></div>
                            <div><label htmlFor="userLastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label> <input id="userLastName" name="userLastName" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter last name"/></div>
                        </div>
                        <div><label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label> <input id="userEmail" name="userEmail" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter your email"/></div>
                        <div><label htmlFor="userGender" className="block text-sm font-medium text-gray-700 mb-2">Gender</label> <select id="userGender" name="userGender" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"> <option value="">Select gender</option> <option value="male">Male</option> <option value="female">Female</option> <option value="other">Other</option> <option value="prefer-not-to-say">Prefer not to say</option> </select></div>
                        <div><label htmlFor="userAge" className="block text-sm font-medium text-gray-700 mb-2">Age</label> <input id="userAge" name="userAge" type="number" min="18" max="100" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" placeholder="Enter your age"/></div>
                        <div><label htmlFor="userCity" className="block text-sm font-medium text-gray-700 mb-2">City</label> <select id="userCity" name="userCity" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"> <option value="">Select your city</option> <option value="bangalore">Bangalore</option> <option value="mumbai">Mumbai</option> <option value="delhi">Delhi</option> <option value="hyderabad">Hyderabad</option> <option value="chennai">Chennai</option> <option value="pune">Pune</option> <option value="kolkata">Kolkata</option> <option value="ahmedabad">Ahmedabad</option> <option value="other">Other</option> </select></div>
                        <div className="flex items-center"><input id="agreeTerms" name="agreeTerms" type="checkbox" required className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"/> <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900"> I agree to the <a href="#" className="text-emerald-600 hover:text-emerald-500">Terms and Conditions</a> and <a href="#" className="text-emerald-600 hover:text-emerald-500">Privacy Policy</a> </label></div>
                        <button type="submit" className="w-full bg-emerald-600 text-white py-3 px-4 rounded-md hover:bg-emerald-700 transition-colors font-medium"> Complete Registration </button>
                    </form>
                </div>
              </div>
            </div>
        );
    }
};

export default MobileOTPFlow;
