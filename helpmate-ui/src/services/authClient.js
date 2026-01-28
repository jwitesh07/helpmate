// src/services/authClient.js

const BASE_URL = "http://localhost:3000/api/v1/user";

/**
 * Helper function to handle fetch responses
 * @param {Response} response - The fetch response object
 */
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        // Throw an error with the message from the backend AppError/JSON response
        const errorMessage = data.message || 'An unknown error occurred';
        throw new Error(errorMessage);
    }
    return data;
};

// --- EXISTING AUTH FUNCTIONS ---

/**
 * Step 1: Send OTP to the user's phone number
 * @param {string} phone_number - The 10-digit number (e.g., '9876543210')
 * @returns {Promise<{message: string, user_id: number}>}
 */
export const sendOtp = async (phone_number) => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number }),
    });
    return handleResponse(response);
};

/**
 * Step 2: Verify the OTP
 * @param {string} phone_number - The user's phone number
 * @param {string} otp - The 4-digit OTP code
 * @returns {Promise<{success: boolean, message: string, is_new_user: boolean, token?: string}>} 
 */
export const verifyOtp = async (phone_number, otp) => {
    const response = await fetch(`${BASE_URL}/login/verifyOtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number, otp }),
    });
    return handleResponse(response);
};

/**
 * Step 3: Complete registration for new users
 * @param {number} user_id - The user ID received from the sendOtp step
 * @param {object} profileData - First Name, Email, Gender, etc.
 * @returns {Promise<{success: boolean, message: string, token?: string}>} 
 */
export const completeRegistration = async (user_id, profileData) => {
    const payload = {
        user_id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        gender: profileData.gender,
        age: profileData.age,
        city: profileData.city,
        // profile_photo_url is optional/missing in the form, but include it if your backend requires it
    };

    const response = await fetch(`${BASE_URL}/login/registerUser`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

// --- NEW PROFILE AND LOGOUT FUNCTIONS FOR DROPDOWN INTEGRATION ---

/**
 * NEW: Fetches the authenticated user's profile details.
 * NOTE: Assumes JWT is stored in localStorage as 'authToken'.
 * @returns {Promise<{user: object}>} - Returns the user object directly from the backend.
 */
export const fetchUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error("Authentication token not found.");
    }

    // Corresponds to your backend route: router.get("/profile", ...)
    const response = await fetch(`${BASE_URL}/profile`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Crucial for authentication
        },
    });

    // The parent component will handle mapping the keys (e.g., first_name to firstName)
    return handleResponse(response);
};

/**
 * NEW: Handles local and server-side logout (if applicable).
 * NOTE: Assuming a simple client-side token removal, but keeps the function signature for future server-side invalidation.
 */
export const logoutUser = () => {
    // 1. Remove the token from local storage (Client-side logout)
    localStorage.removeItem('authToken');
    
    // 2. Add logic here if your backend has a /logout endpoint to invalidate tokens (optional)
    console.log("Client-side logout complete.");
    
    // You typically don't need a promise for simple client-side logout, 
    // but if you add a fetch call above, you'd change the return type.
    return { success: true, message: "Logged out successfully" };
};