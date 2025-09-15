const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateUser,
  deleteUser,
  refreshToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Auth
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);

// Protected
router.get("/profile", protect, getProfile);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

module.exports = router;
