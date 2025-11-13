import api from "../api";

// ================== ✅ USER ROUTES ==================

// Public routes
export const initiateRegistration = (data) => api.post("/api/users/register", data);
export const verifyEmail = (data) => api.post("/api/users/verify-email", data);
export const resendVerificationCode = (data) => api.post("/api/users/resend-verification", data);
export const login = (data) => api.post("/api/users/login", data);
export const logout = () => api.post("/api/users/logout");
export const refreshToken = () => api.post("/api/users/refresh");

// Protected routes (require authentication)
export const getProfile = () => api.get("/api/users/profile");
export const updateProfile = (data) => api.put("/api/users/profile", data);
export const getUserOrders = () => api.get("/api/users/orders");

// Admin only routes
export const getAllUsers = () => api.get("/api/users");
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

export default api;