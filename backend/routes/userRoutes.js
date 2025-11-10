
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", userController.initiateRegistration);
router.post("/verify-email", userController.verifyEmail);
router.post("/resend-verification", userController.resendVerificationCode);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.post("/refresh", userController.refreshToken);

// Protected routes
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, userController.updateProfile);
router.get("/orders", protect, userController.getUserOrders);
router.put("/:id", protect, userController.updateUser);
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;