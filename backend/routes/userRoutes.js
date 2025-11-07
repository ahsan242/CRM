
// // // const express = require("express");
// // // const router = express.Router();
// // // const {
// // //   login,
// // //   logout,
// // //   getProfile,
// // //   updateUser,
// // //   deleteUser,
// // //   refreshToken,
// // //   initiateRegistration,
// // //   verifyEmail,
// // //   resendVerificationCode,
// // //   debugLogin, // Make sure this is imported
// // //   // tokenBlacklist // If needed
// // // } = require("../controllers/userController");
// // // const { protect } = require("../middleware/authMiddleware");

// // // // Auth routes
// // // router.post("/register", initiateRegistration);
// // // router.post("/verify-email", verifyEmail);
// // // router.post("/resend-verification", resendVerificationCode);
// // // router.post("/login", login);
// // // router.post("/logout", logout);
// // // router.post("/refresh", refreshToken);
// // // router.post("/debug-login", debugLogin); // Fixed: use the imported function
// // // // router.post('/debug-password', exports.debugPassword);


// // // // Protected routes
// // // router.get("/profile", protect, getProfile);
// // // router.put("/:id", protect, updateUser);
// // // router.delete("/:id", protect, deleteUser);

// // // module.exports = router;

// // const express = require("express");
// // const router = express.Router();
// // const {
// //   login,
// //   logout,
// //   getProfile,
// //   updateUser,
// //   deleteUser,
// //   refreshToken,
// //   initiateRegistration,
// //   verifyEmail,
// //   resendVerificationCode,
// //   debugLogin,
// //   debugPassword,
// //   fixPassword
// // } = require("../controllers/userController");
// // const { protect } = require("../middleware/authMiddleware");

// // // Auth routes
// // router.post("/register", initiateRegistration);
// // router.post("/verify-email", verifyEmail);
// // router.post("/resend-verification", resendVerificationCode);
// // router.post("/login", login);
// // router.post("/logout", logout);
// // router.post("/refresh", refreshToken);
// // router.post("/debug-login", debugLogin);
// // router.post("/debug-password", debugPassword);
// // router.post("/fix-password", fixPassword); // Temporary route to fix passwords

// // // Protected routes
// // router.get("/profile", protect, getProfile);
// // router.put("/:id", protect, updateUser);
// // router.delete("/:id", protect, deleteUser);

// // module.exports = router;

// const express = require("express");
// const router = express.Router();
// const userController = require("../controllers/userController");
// const { protect } = require("../middleware/authMiddleware");

// // Auth routes
// router.post("/register", userController.initiateRegistration);
// router.post("/verify-email", userController.verifyEmail);
// router.post("/resend-verification", userController.resendVerificationCode);
// router.post("/login", userController.login);
// router.post("/logout", userController.logout);
// router.post("/refresh", userController.refreshToken);

// // Debug routes (remove in production)
// router.post("/debug-login", userController.debugLogin);
// router.post("/debug-password", userController.debugPassword);
// router.post("/fix-password", userController.fixPassword);

// // Protected routes
// router.get("/profile", protect, userController.getProfile);
// router.put("/profile", protect, userController.updateProfile);
// router.get("/orders", protect, userController.getUserOrders);
// router.get("/statistics", protect, userController.getOrderStatistics);
// router.put("/:id", protect, userController.updateUser);
// router.delete("/:id", protect, userController.deleteUser);

// module.exports = router;

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