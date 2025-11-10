// const express = require("express");
// const router = express.Router();
// const analyticsController = require("../controllers/analyticsController");
// const { protect, admin } = require("../middleware/authMiddleware");

// // Sales analytics routes
// router.get("/sales-dashboard", protect, admin, analyticsController.getSalesDashboard);
// router.get("/product-performance", protect, admin, analyticsController.getProductPerformance);
// router.get("/customer-analytics", protect, admin, analyticsController.getCustomerAnalytics);
// router.get("/real-time-metrics", protect, admin, analyticsController.getRealTimeMetrics);

// module.exports = router;

const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const { protect, admin } = require("../middleware/authMiddleware");

// Sales analytics routes
router.get("/sales-dashboard", protect, admin, analyticsController.getSalesDashboard);
router.get("/product-performance", protect, admin, analyticsController.getProductPerformance);
router.get("/customer-analytics", protect, admin, analyticsController.getCustomerAnalytics);
router.get("/real-time-metrics", protect, admin, analyticsController.getRealTimeMetrics);

module.exports = router;