// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// Create order
router.post("/", orderController.createOrder);

// Get orders
router.get("/", orderController.getOrders);

// Get single order
router.get("/:id", orderController.getOrder);

// Update order status
router.put("/:id/status", orderController.updateOrderStatus);

// Cancel order
router.put("/:id/cancel", orderController.cancelOrder);

// Update payment status
router.put("/:id/payment", orderController.updatePaymentStatus);

module.exports = router;