const express = require("express");
const router = express.Router();
const productInquiryController = require("../controllers/productInquiryController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/", productInquiryController.createInquiry);

// Admin routes (protected)
router.get("/", protect, admin, productInquiryController.getAllInquiries);
router.get("/stats", protect, admin, productInquiryController.getInquiryStats);
router.get("/product/:productId", protect, admin, productInquiryController.getInquiriesByProduct);
router.get("/:id", protect, admin, productInquiryController.getInquiryById);
router.put("/:id", protect, admin, productInquiryController.updateInquiryStatus);

module.exports = router;