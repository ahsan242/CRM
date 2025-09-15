// import api from "../api";

// // ================== ✅ TECH PRODUCT NAME ROUTES ==================
// export const createTechProductName = (data) => api.post("/api/tech-product-names", data);
// export const getTechProductNames = () => api.get("/api/tech-product-names");
// export const getTechProductName = (id) => api.get(`/api/tech-product-names/${id}`);
// export const updateTechProductName = (id, data) => api.put(`/api/tech-product-names/${id}`, data);
// export const deleteTechProductName = (id) => api.delete(`/api/tech-product-names/${id}`);



// export default api;


import api from "../api"; // axios instance with baseURL

// ================== TECH PRODUCT NAME ROUTES ==================
export const getTechProductNames = () => api.get("/api/techproductnames");

export const getTechProductNameById = (id) =>
  api.get(`/api/tech-product-names/${id}`);

export const createTechProductName = (data) =>
  api.post("/api/tech-product-names", data);

export const updateTechProductName = (id, data) =>
  api.put(`/api/tech-product-names/${id}`, data);

export const deleteTechProductName = (id) =>
  api.delete(`/api/tech-product-names/${id}`);
