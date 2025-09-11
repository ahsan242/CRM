import api from "../api";

// ================== ✅ BRAND ROUTES ==================
export const createBrand = (data) => api.post("/api/brands", data);
export const getBrands = () => api.get("/api/brands");
export const getBrand = (id) => api.get(`/api/brands/${id}`);
export const updateBrand = (id, data) => api.put(`/api/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/api/brands/${id}`);

export default api;