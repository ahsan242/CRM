// frontend/src/http/productForImport.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Product For Import API calls
export const createproductForImport = async (data) => {
  
    const res = await api.post('/api/productforimports', data);
    return res.data;
  
};

export const bulkCreateproductsForImport = async (products) => {
  
    const res = await api.post('/api/productforimports/bulk', { products });
    return res.data;
  
};

export const getproductsForImport = async (params = {}) => {
  
    const res = await api.get('/api/productforimports', { params });
    return res.data;
  
};

export const getproductForImportStats = async () => {
  
    const res = await api.get('/api/productforimports/stats');
    return res.data;
 
};

export const updateproductForImport = async (id, data) => {
  
    const res = await api.put(`/api/productforimports/${id}`, data);
    return res.data;
 
};

export const deleteproductForImport = async (id) => {
  
    const res = await api.delete(`/api/productforimports/${id}`);
    return res.data;
  
};

export const bulkUpdateproductStatus = async (productIds, status) => {
  
    const res = await api.patch('/api/productforimports/bulk-status', {
      productIds,
      status
    });
    return res.data;
  
};