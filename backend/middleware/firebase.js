const admin = require('firebase-admin'); // Already imported and initialized in app.js
// const db = require('../database/db.js'); // Assuming your database connection utility exists

/**
 * Verifies the Firebase ID Token sent from the client and extracts user information.
 * This function should be used in your Express controllers for authentication.
 * * @param {string} idToken - The Firebase ID Token received from the client.
 * @returns {Promise<object>} The decoded token payload (containing uid, phone_number, etc.).
 */
async function verifyFirebaseToken(idToken) {
    if (!idToken) {
        throw new Error("Authorization token is missing.");
    }

    try {
        // The Admin SDK verifies the signature of the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Ensure the token has a valid UID (user identifier)
        if (!decodedToken.uid) {
            throw new Error("Token verification failed: UID missing.");
        }

        console.log(`Firebase Token verified for UID: ${decodedToken.uid}`);
        return decodedToken;
        
    } catch (error) {
        // Specific error handling for expired, malformed, or revoked tokens
        console.error("Firebase ID Token verification error:", error.message);
        throw new Error("Invalid or expired authentication token.");
    }
}

/**
 * Example function to create a new user in your SQL database 
 * ONLY AFTER the Firebase token has been successfully verified.
 * * @param {object} userData - Contains full_name, email, phone_number, and the firebase_uid.
 */
// async function createUserInDatabase(userData) {
//     // Implementation depends on your dbquerieshandlers.js utility
//     // Example using a placeholder function for database interaction:
//     // const SQL = "INSERT INTO users (uid, email, full_name, phone_number, is_verified) VALUES (?, ?, ?, ?, TRUE)";
//     // await db(SQL, [userData.firebase_uid, userData.email, userData.full_name, userData.phone_number]);
//     return { success: true, user_id: userData.firebase_uid };
// }


module.exports = {
  verifyFirebaseToken,
  // createUserInDatabase, // Include if you want to export the database creation logic
};
