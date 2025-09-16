// import api from "../api"; // axios instance with baseURL

// // ✅ Tech Product Names (for dropdown)
// export const getAllTechProductNames = async () => {
//   const res = await api.get("/api/techProductNames"); 
//   return res.data;
// };

// // ✅ Tech Products CRUD
// export const getAllTechProducts = async () => {
//   const res = await api.get("/api/techProducts");
//   return res.data;
// };

// export const getTechProductById = async (id) => {
//   const res = await api.get(`/api/techProducts/${id}`);
//   return res.data;
// };

// export const createTechProduct = async (payload) => {
//   const res = await api.post("/api/techProducts", payload);
//   return res.data;
// };

// export const updateTechProduct = async (id, payload) => {
//   const res = await api.put(`/api/techProducts/${id}`, payload);
//   return res.data;
// };

// export const deleteTechProduct = async (id) => {
//   const res = await api.delete(`/api/techProducts/${id}`);
//   return res.data;
// };

import api from "../api";

// ✅ Tech Product Names (for dropdown)
export const getAllTechProductNames = async () => {
  const res = await api.get("/api/techProductNames"); 
  return res.data;
};

// ✅ Tech Products CRUD
export const getAllTechProducts = async () => {
  const res = await api.get("/api/techProducts");
  return res.data;
};

export const getTechProductById = async (id) => {
  const res = await api.get(`/api/techProducts/${id}`);
  return res.data;
};

export const createTechProduct = async (payload) => {
  const res = await api.post("/api/techProducts", payload);
  return res.data;
};

export const updateTechProduct = async (id, payload) => {
  const res = await api.put(`/api/techProducts/${id}`, payload);
  return res.data;
};

export const deleteTechProduct = async (id) => {
  const res = await api.delete(`/api/techProducts/${id}`);
  return res.data;
};