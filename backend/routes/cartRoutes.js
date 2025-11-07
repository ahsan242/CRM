// // backend/routes/cartRoutes.js
// const express = require("express");
// const router = express.Router();
// const cartController = require("../controllers/cartController");

// // Get cart
// router.get("/", cartController.getCart);

// // Add to cart
// router.post("/add", cartController.addToCart);

// // Update cart item
// router.put("/:cartId/items", cartController.updateCartItem);

// // Remove from cart
// router.delete("/:cartId/items", cartController.removeFromCart);

// // Clear cart
// router.delete("/:cartId/clear", cartController.clearCart);

// module.exports = router;

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// Get cart
router.get("/", cartController.getCart);

// Add to cart
router.post("/add", cartController.addToCart);

// Update cart item
router.put("/:cartId/items", cartController.updateCartItem);

// Remove from cart
router.delete("/:cartId/items", cartController.removeFromCart);

// Clear cart
router.delete("/:cartId/clear", cartController.clearCart);

// Merge carts (when user logs in)
router.post("/merge", protect, cartController.mergeCarts);

module.exports = router;