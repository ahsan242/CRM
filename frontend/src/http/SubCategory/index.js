
// src/helpers/data.js
import api from "../api";

// ========== CATEGORY ROUTES ========== 
export const getAllCategories = async () => {
  const res = await api.get("/api/Categories");
  return res.data;
};

// ========== SUBCATEGORY ROUTES ==========
export const getSubCategories = async () => {
  const res = await api.get("/api/subcategories");
  // console.log('Fetched subcategories by hook:', res.data); // Debug log
  return res.data;
};

export const getSubCategory = async (id) => {
  const res = await api.get(`/api/subcategories/${id}`);
  return res.data;
};

export const createSubCategory = async (data) => {
  const res = await api.post("/api/subcategories", data);
  return res.data;
};

export const updateSubCategory = async (id, data) => {
  const res = await api.put(`/api/subcategories/${id}`, data);
  return res.data;
};

export const deleteSubCategory = async (id) => {
  const res = await api.delete(`/api/subcategories/${id}`);
  return res.data;
};
