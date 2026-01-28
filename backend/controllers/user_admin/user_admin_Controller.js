const db = require("../../database/db");
const AppError = require("../../utils/appError");
const catchAsyncError = require("../../utils/catchAsyncError");
const getData = require("../../database/dbquerieshandlers");
const Razorpay = require("razorpay");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  generateInsertStatement,
  generateUpdateStatement,
} = require("../../database/sqlStatementGenarator");





exports.getProfileDetails = catchAsyncError(async (req, res, next) => {
    // 1. Get the user ID from the middleware (req.user.id)
    const user_id = req.user.id; 

    // 2. SQL query to combine data from both tables using LEFT JOIN
    const sql = `
        SELECT
            u.user_id, u.phone_number, u.country_code, u.otp_verified, u.is_registered, u.current_role, u.is_active,
            p.first_name, p.last_name, p.email, p.gender, p.age, p.city, p.profile_photo_url
        FROM users u
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        WHERE u.user_id = ?;
    `;

    const profileData = await db(sql, [user_id]);

    if (profileData.length === 0) {
        // This is a safety check, but should ideally not happen after successful token verification
        return next(new AppError("Profile data not found.", 404));
    }

    // 3. Send the response
    res.status(200).json({
        status: 'success',
        data: {
            user: profileData[0]
        }
    });
});
exports.postTask = catchAsyncError(async (req, res, next) => {
    // 1. Get requester_id from the authenticated user (e.g., from protectUser middleware)
    const requester_id = req.user.id; 

    // 2. Destructure and extract necessary fields from the request body
    const { 
        type, 
        title, 
        description, 
        location, // Maps to 'location_details' in DB
        category,     
        budget,       
        reward_xp     
    } = req.body;

    // --- 3. Validation and Business Logic Checks ---

    // Basic Validation: Check for universally mandatory fields
    if (!title || !description || !location || !type) {
        return next(new AppError("Missing mandatory task fields: title, description, location, and type.", 400));
    }
    
    // Check if 'type' is one of the valid ENUM values
    if (type !== 'regular' && type !== 'enquiry') {
         return next(new AppError("Invalid task type. Must be 'regular' or 'enquiry'.", 400));
    }

    // Business Rule: Regular tasks require category and budget
    if (type === 'regular' && (!category || !budget)) {
        return next(new AppError("Regular tasks require a category and a budget.", 400));
    }
    
    // Business Rule: Validate ENUM for category if provided (only for 'regular')
    const validCategories = ['delivery', 'cleaning', 'tech', 'moving', 'other'];
    if (type === 'regular' && category && !validCategories.includes(category)) {
        return next(new AppError(`Invalid category: ${category}.`, 400));
    }


    // --- 4. Prepare SQL and Values based on Task Type ---
    
    const insertSql = `
        INSERT INTO tasks 
        (requester_id, type, title, description, location_details, category, budget, reward_xp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Set parameters conditionally based on task type. 
    // Use null for fields that are not relevant to the specific task type.
    const values = [
        requester_id, 
        type, 
        title, 
        description, 
        location, // Maps to 'location_details'
        // 'regular' task fields: category and budget
        type === 'regular' ? category : null,
        type === 'regular' ? budget : null,
        // 'enquiry' task field: reward_xp
        type === 'enquiry' ? reward_xp : null // Only enquiries *may* offer XP
    ];
    
    // --- 5. Insert into Database and Respond ---
    
    // Assuming 'db' executes the query and returns a result object with insertId
    const result = await db(insertSql, values);
    const taskId = result.insertId;

    res.status(201).json({
        status: 'success',
        message: `${type === 'regular' ? 'Task' : 'Enquiry'} posted successfully!`,
        data: {
            task_id: taskId,
        },
    });
});
// =======================
// ✅ ACCEPT TASK
// =======================
// controllers/userController.js
exports.acceptTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const helperId = req.user.id; // assuming JWT middleware adds user

        // Check if task exists
        const [task] = await db("SELECT * FROM tasks WHERE task_id = ?", [taskId]);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Create a new assignment
        const result = await db(
            "INSERT INTO task_assignments (task_id, helper_id, assignment_status) VALUES (?, ?, 'active')",
            [taskId, helperId]
        );

        const assignmentId = result.insertId;

        // Update task status
        await db("UPDATE tasks SET status = 'assigned' WHERE task_id = ?", [taskId]);

        // Return new assignment info to frontend
        return res.status(200).json({
            message: "Task accepted successfully!",
            assignment_id: assignmentId,
            task_id: taskId,
            helper_id: helperId,
        });
    } catch (err) {
        console.error("Error accepting task:", err);
        res.status(500).json({ message: "Failed to accept task", error: err.message });
    }
};




// controllers/userController.js (or user_admin_Controller.js)
exports.getRequestedTasks = async (req, res) => {
  try {
    const requesterId = req.user.id; // from auth middleware

    const sql = `
      SELECT 
        t.task_id,
        t.title,
        t.description,
        t.status,
        t.type,
        t.category,
        t.budget,
        t.reward_xp,
        t.created_at,
        ta.assignment_id,
        ta.helper_id,
        up.first_name AS helper_first_name,
        up.last_name AS helper_last_name,
        ta.helper_rating
      FROM tasks t
      LEFT JOIN task_assignments ta ON t.task_id = ta.task_id
      LEFT JOIN user_profiles up ON ta.helper_id = up.user_id
      WHERE t.requester_id = ?
      ORDER BY t.created_at DESC
    `;

    const results = await db(sql, [requesterId]);
    res.status(200).json({
      success: true,
      data: { tasks: results }
    });

  } catch (err) {
    console.error("Error fetching requested tasks:", err);
    res.status(500).json({ message: "Failed to fetch requested tasks" });
  }
};

// =======================
// 💼 GET AVAILABLE TASKS (Helper Dashboard)
// =======================
exports.getAvailableTasks = catchAsyncError(async (req, res, next) => {
    // 1. Get the current helper's ID from the authenticated user.
    const helper_id = req.user.id; 

    // FIX: Add condition to exclude tasks where requester_id equals helper_id
    const sql = `
        SELECT
            t.task_id, t.title, t.description, t.location_details, t.type, t.category, t.budget, t.reward_xp, t.created_at,
            (
                SELECT ROUND(AVG(helper_rating), 1) 
                FROM task_assignments ta 
                JOIN tasks t2 ON ta.task_id = t2.task_id 
                WHERE t2.requester_id = t.requester_id AND ta.helper_rating IS NOT NULL
            ) AS requester_avg_rating
        FROM tasks t
        WHERE t.status = 'open' 
        AND t.requester_id != ?  /* <--- CRITICAL FIX: Exclude self-posted tasks */
        ORDER BY t.created_at DESC
        LIMIT 20;
    `;

    const tasks = await db(sql, [helper_id]); // Pass helper_id into the query parameters
    
    // Transform data for frontend consumption
    const responseData = tasks.map(task => ({
// ... (rest of the mapping logic remains the same) ...
        id: task.task_id,
        title: task.title,
        desc: task.description,
        pay: task.budget,
        xp: task.reward_xp, 
        type: task.type,
        category: task.category,
        dist: (Math.random() * 5 + 0.5).toFixed(1),
        time: Math.floor(Math.random() * 8) + 1 + ' hours ago',
        rating: task.requester_avg_rating || (Math.random() * 0.4 + 4.5).toFixed(1), 
    }));


    res.status(200).json({
        status: 'success',
        results: responseData.length,
        data: {
            tasks: responseData
        }
    });
});