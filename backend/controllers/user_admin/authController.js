const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const { sendFast2OTP, VerifyFast2OTP } = require("../../middleware/fast2sms");
const { promisify } = require("util");



exports.sendOtp = catchAsyncError(async (req, res, next) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return next(new AppError("Phone number is required.", 400));
  }

  const checkUserSql = "SELECT user_id, is_registered FROM users WHERE phone_number = ?";
  const userResult = await db(checkUserSql, [phone_number]);
  let userId;

  if (userResult.length === 0) {
    // New User: Create minimal user record
    const insertUserSql = "INSERT INTO users (phone_number) VALUES (?)";
    const result = await db(insertUserSql, [phone_number]);
    userId = result.insertId;
  } else {
    // Existing User
    userId = userResult[0].user_id;
  }

  // Use the REAL imported sendFast2OTP service. 
  // The service handles inserting the VID into the 'otp' table internally.
  try {
      await sendFast2OTP(phone_number);
  } catch (error) {
      console.error("Error calling external OTP service:", error);
      return next(new AppError("Failed to send OTP. Please try again.", 500));
  }
  
  res.status(200).json({
    status: 'success',
    message: "OTP sent successfully to your phone number.",
    user_id: userId,
  });
});
// =======================
// 🔐 VERIFY OTP
// =======================
exports.verifyOtp = catchAsyncError(async (req, res, next) => {
  const { phone_number, otp } = req.body;

  if (!phone_number || !otp) {
    return next(new AppError("Phone number and OTP are required.", 400));
  }

  // Get latest OTP entry
  const searchOtpSql =
    "SELECT * FROM otp WHERE mobile = ? ORDER BY created_at DESC LIMIT 1";
  const otpResult = await db(searchOtpSql, [phone_number]);

  if (otpResult.length === 0) {
    return next(new AppError("No valid OTP found for this number.", 404));
  }

  const storedOtp = otpResult[0];
  let otpVerified = false;

  try {
    // Assuming VerifyFast2OTP is an async utility function
    otpVerified = await VerifyFast2OTP(storedOtp.vid, otp); 
  } catch (error) {
    console.error("OTP verification failed:", error);
    return next(new AppError("OTP verification service failed.", 500));
  }

  if (!otpVerified) {
    return next(new AppError("Invalid OTP or verification failed.", 400));
  }

  // --- OTP Verification Successful ---

  const findUserSql = "SELECT * FROM users WHERE phone_number = ?";
  let userResult = await db(findUserSql, [phone_number]);
  let user;

  let isNewUser = false;

  if (userResult.length === 0) {
    // 🟢 Case 1: brand new user — create record
    const insertUserSql = `
      INSERT INTO users (phone_number, otp_verified, is_registered)
      VALUES (?, TRUE, FALSE)
    `;
    const insertResult = await db(insertUserSql, [phone_number]);
    isNewUser = true;
    
    // Fetch the newly created user to get the user_id (necessary for JWT later)
    userResult = await db(findUserSql, [phone_number]); 
    user = userResult[0];

  } else {
    // 🟡 Case 2: existing user — just update otp_verified
    const updateUserSql = `
      UPDATE users SET otp_verified = TRUE WHERE phone_number = ?
    `;
    await db(updateUserSql, [phone_number]);

    user = userResult[0];
    // Determine newness based on registration status
    isNewUser = !user.is_registered;
  }
  
  // --- FINAL RESPONSE LOGIC ---
  
  // If the user is logging back in (not a new user requiring details)
  if (!isNewUser) {
    // 1. Generate JWT Token
    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // 2. Respond with success and the token
    return res.status(200).json({
        success: true,
        message: "Login successful.",
        is_new_user: false,
        token: token, // <--- TOKEN IS INCLUDED HERE
    });
  }

  // If the user is new (requires registration details)
  // We still return 200, but without the token, prompting the client to go to step 3 (details)
  res.status(200).json({
    success: true,
    message: "OTP verified successfully. Proceed to profile details.",
    is_new_user: isNewUser, // This is true
  });
});

exports.completeRegistration = catchAsyncError(async (req, res, next) => {
  const { user_id, first_name, last_name, email, gender, age, city, profile_photo_url } = req.body;

  // Basic validation (using AppError for consistency)
  if (!user_id || !first_name || !email) {
    return next(new AppError("Missing required fields: user_id, first_name, and email are mandatory.", 400));
  }

  // 1️⃣ Check if the user exists
  const users = await db("SELECT * FROM users WHERE user_id = ?", [user_id]);
  if (users.length === 0) {
    return next(new AppError("User not found.", 404));
  }

  const user = users[0];

  // 2️⃣ Check if OTP verified
  if (!user.otp_verified) {
    return next(new AppError("OTP not verified. Please verify your phone number first.", 400));
  }

  // 3️⃣ Prevent duplicate registration
  if (user.is_registered) {
    // If they hit this route and are already registered, treat it as a successful final step
  }

  // 4️⃣ Insert user profile
  await db(
    `INSERT INTO user_profiles 
     (user_id, first_name, last_name, email, gender, age, city, profile_photo_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, first_name, last_name, email, gender, age, city, profile_photo_url]
  );

  // 5️⃣ Update the user table
  await db(
    `UPDATE users 
     SET is_registered = TRUE, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = ?`,
    [user_id]
  );
  
  // 6️⃣ Generate JWT Token
  const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // 7️⃣ Respond with success and the token
  res.status(201).json({
    success: true,
    message: "User registration and login completed successfully",
    token: token, // <-- JWT TOKEN INCLUDED HERE
  });
});




exports.protectUser = catchAsyncError(async (req, res, next) => {
    let token;

    // 1) Get token and check if it exists
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        // Extract the token part
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(
            new AppError("You are not logged in! Please login first.", 401)
        );
    }

    // 2) Verify token: Use try-catch for immediate JWT error handling
    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
        // This catch block handles TokenExpiredError, JsonWebTokenError, etc.
        console.error("JWT Verification failed:", err.message);
        return next(new AppError("Invalid or expired token. Please log in again.", 401));
    }
    
    // 3) Check if user still exists
    const searchUserSql = `SELECT user_id, is_active FROM users WHERE user_id = ?`;
    const searchResult = await db(searchUserSql, [decoded.id]);

    if (searchResult.length === 0) {
        return next(
            new AppError("The user belonging to this token no longer exists.", 401)
        );
    }

    // Optional: Check if the user is active (good practice)
    if (searchResult[0].is_active === 0) {
         return next(
            new AppError("Your account has been deactivated.", 403)
        );
    }
    
    // 4) GRANT ACCESS TO PROTECTED ROUTE
    req.user = {
        id: searchResult[0].user_id
    };

    next();
});