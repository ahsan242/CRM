import axios from "axios";

import api from "../api";
// ================== ✅ CATEGORY ROUTES ==================

export const createCategory = (data) => api.post("/api/Categories", data);
export const getCategories = () => api.get("/api/Categories");
export const getCategory = (id) => api.get(`/api/categories/${id}`);
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

export default api;