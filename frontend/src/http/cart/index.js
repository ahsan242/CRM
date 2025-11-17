// import api from "../api";

// // ================== ✅ CART ROUTES ==================

// // Public routes (cart operations without authentication)
// export const getCart = () => api.get("/api/cart");
// export const addToCart = (data) => api.post("/api/cart/add", data);
// export const updateCartItem = (cartId, data) => api.put(`/api/cart/${cartId}/items`, data);
// export const removeFromCart = (cartId, data) => api.delete(`/api/cart/${cartId}/items`, data);
// export const clearCart = (cartId) => api.delete(`/api/cart/${cartId}/clear`);

// // Protected routes (require authentication)
// export const mergeCarts = (data) => api.post("/api/cart/merge", data);

// // Admin only routes (require authentication and admin privileges)
// export const getAllCarts = () => api.get("/api/cart/all");

// export default api;

import api from "../api";

// Cart API functions
export const getCart = async (userId = null, sessionId = null) => {
  try {
    const params = {};
    if (userId) params.userId = userId;
    if (sessionId) params.sessionId = sessionId;
    
    const response = await api.get('/api/carts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (cartData) => {
  try {
    const response = await api.post('/api/carts/add', cartData);
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (cartId, itemData) => {
  try {
    const response = await api.put(`/api/carts/${cartId}/items`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (cartId, productData) => {
  try {
    const response = await api.delete(`/api/carts/${cartId}/items`, { data: productData });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async (cartId) => {
  try {
    const response = await api.delete(`/api/carts/${cartId}/clear`);
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const mergeCarts = async (mergeData) => {
  try {
    const response = await api.post('/api/carts/merge', mergeData);
    return response.data;
  } catch (error) {
    console.error('Error merging carts:', error);
    throw error;
  }
};