import api from "../api";

// Product-related API functions
export const createProduct = (data) => {
  const formData = new FormData();
  console.log('Creating product with data:', data);
  // Append all text fields
  Object.keys(data).forEach(key => {
    if (key !== 'mainImage' && key !== 'detailImages') {
      formData.append(key, data[key]);
    }
  });
  
  // Append main image
  if (data.mainImage && data.mainImage instanceof File) {
    formData.append('mainImage', data.mainImage);
  }
  
  // Append detail images
  if (data.detailImages && Array.isArray(data.detailImages)) {
    data.detailImages.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('detailImages', image);
      }
    });
  }
  console.log('Form Data Entries:', Array.from(formData));
  return api.post("/api/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getProducts = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/api/products?${queryString}`);
};

export const getProduct = (id) => api.get(`/api/products/${id}`);

export const updateProduct = (id, data) => {
  const formData = new FormData();
  
  // Append all text fields
  Object.keys(data).forEach(key => {
    if (key !== 'mainImage' && key !== 'detailImages') {
      formData.append(key, data[key]);
    }
  });
  
  // Append main image
  if (data.mainImage && data.mainImage instanceof File) {
    formData.append('mainImage', data.mainImage);
  }
  
  // Append detail images
  if (data.detailImages && Array.isArray(data.detailImages)) {
    data.detailImages.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('detailImages', image);
      }
    });
  }
  
  return api.put(`/api/products/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

// Category-related functions (if they're in the same file)
export const getAllProductCategories = () => api.get("/api/categories");

// If categories are in a separate file, you might need to import them differently
// export { getAllProductCategories } from './categories';