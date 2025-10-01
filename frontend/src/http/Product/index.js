// src/http/Product.js
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000' // Your backend URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export const importProductFromIcecat = async (data) => {
  try {
    const response = await api.post('/api/products/import', data)
    return response.data
  } catch (error) {
    // Extract meaningful error message
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to import product'
    throw new Error(errorMessage)
  }
}


export const getImportedProducts = async (url = '/api/productforimports') => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch imported products';
    throw new Error(errorMessage);
  }
};

export const createProduct = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/products`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProduct = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProduct = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/products/${id}`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/products/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllProductCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/categories`)
    return response.data
  } catch (error) {
    throw error
  }
}

// new functions for Excel import and job status

export const importProductsFromExcel = async (data) => {
  try {
    const response = await api.post('/api/products/import-excel', data)
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to import products from Excel'
    throw new Error(errorMessage)
  }
}

export const getImportJobs = async () => {
  try {
    const response = await api.get('/api/products/import-jobs')
    return response.data
  } catch (error) {
    throw error
  }
}


export const importFromProductForImport = async (config) => {
  try {
    const response = await api.post('/api/products/import-from-productforimport', config);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to start batch import';
    throw new Error(errorMessage);
  }
};

export const getImportJobStatus = async (jobId) => {
  try {
    const response = await api.get(`/api/products/import-jobs/${jobId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch job status';
    throw new Error(errorMessage);
  }
};

export const getDailyUsage = async () => {
  try {
    const response = await api.get('/api/products/daily-usage');
    return response.data;
  } catch (error) {
    // Fallback if endpoint doesn't exist
    return { used: 0, limit: 199, remaining: 199 };
  }
};


// Add to your existing Product.js file

export const bulkImportProducts = async (data) => {
  try {
    const response = await api.post('/api/products/bulk-import', data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to bulk import products';
    throw new Error(errorMessage);
  }
};

export const getProductsForImport = async (params = {}) => {
  try {
    const response = await api.get('/api/productforimports', { params });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch products for import';
    throw new Error(errorMessage);
  }
};