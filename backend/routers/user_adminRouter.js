const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const authController = require("../controllers/user_admin/authController");
const userController = require("../controllers/user_admin/user_admin_Controller");


router.post("/login",authController.sendOtp);
router.post("/login/verifyOtp",authController.verifyOtp);
router.post("/login/registerUser",authController.completeRegistration);


router.use(authController.protectUser)

router.get("/profile",userController.getProfileDetails);

router.post('/task',userController.postTask)

router.post("/accept/:taskId",userController.acceptTask);


// 1. For Requester Dashboard (My Tasks)
router.get("/tasks/requested",userController.getRequestedTasks);

// 2. For Helper Dashboard (Available Open Tasks)
router.get("/tasks/available",userController.getAvailableTasks);









// router.get("/tasks/accepted",userController.getAcceptedTasks);

// router.post("/task/:taskId/complete",userController.completeTask);

// router.get("/helpers/nearby",userController.getNearbyHelpers);

// router.get("/stats",userController.getUserStats);

// router.put("/profile", userController.updateUserProfile); 





// router.post("/signin", authController.insertUser);
// router.post("/login", authController.loginUser);
// router.post("/login/forgetPassword", authController.forgetPassword);
// router.put("/login/updatePassword", authController.updatePassword);
// router.post("/login/verifyOtp", authController.verifyOtp);
// router.post("/login/sendOtp", authController.sendOtp);




module.exports = router;
