
// const express = require("express");
// const router = express.Router();
// const orderController = require("../controllers/orderController");
// const { protect } = require("../middleware/authMiddleware");

// // Create order
// router.post("/", protect, orderController.createOrder);

// // Payment routes
// router.post("/payment-intent", protect, orderController.createPaymentIntent);
// router.post("/confirm-payment", protect, orderController.confirmPayment);

// // Get orders
// router.get("/", orderController.getOrders);

// // Get single order
// router.get("/:id", protect, orderController.getOrder);

// // Order statistics
// router.get("/user/statistics", protect, orderController.getOrderStatistics);

// // Update order status
// router.put("/:id/status", protect, orderController.updateOrderStatus);

// // Cancel order
// router.put("/:id/cancel", protect, orderController.cancelOrder);

// // Update payment status
// router.put("/:id/payment", protect, orderController.updatePaymentStatus);

// module.exports = router;

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// Create order
router.post("/", protect, orderController.createOrder);

// Payment routes
router.post("/payment-intent", protect, orderController.createPaymentIntent);
router.post("/confirm-payment", protect, orderController.confirmPayment);

// Get orders
router.get("/", orderController.getOrders);

// Get single order
router.get("/:id", protect, orderController.getOrder);

// Order statistics
router.get("/user/statistics", protect, orderController.getOrderStatistics);

// User order history
router.get("/user/history", protect, orderController.getUserOrderHistory);

// Update order status
router.put("/:id/status", protect, orderController.updateOrderStatus);

// Cancel order
router.put("/:id/cancel", protect, orderController.cancelOrder);

// Update payment status
router.put("/:id/payment", protect, orderController.updatePaymentStatus);

// Sales analytics
router.get("/analytics/sales", protect, orderController.getSalesAnalytics);

// Financial reports
router.get("/analytics/financial-reports", protect, orderController.getFinancialReports);

module.exports = router;