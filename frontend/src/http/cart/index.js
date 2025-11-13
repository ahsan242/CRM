import api from "../api";

// ================== ✅ CART ROUTES ==================

// Public routes (cart operations without authentication)
export const getCart = () => api.get("/api/cart");
export const addToCart = (data) => api.post("/api/cart/add", data);
export const updateCartItem = (cartId, data) => api.put(`/api/cart/${cartId}/items`, data);
export const removeFromCart = (cartId, data) => api.delete(`/api/cart/${cartId}/items`, data);
export const clearCart = (cartId) => api.delete(`/api/cart/${cartId}/clear`);

// Protected routes (require authentication)
export const mergeCarts = (data) => api.post("/api/cart/merge", data);

// Admin only routes (require authentication and admin privileges)
export const getAllCarts = () => api.get("/api/cart/all");

export default api;