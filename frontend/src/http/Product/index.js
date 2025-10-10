
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Existing product functions
export const importProductFromIcecat = async (data) => {
  try {
    const response = await api.post('/api/products/import', data)
    return response.data
  } catch (error) {
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
    const response = await api.post('/api/products', formData, {
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
    const response = await api.get('/api/products')
    return response.data
  } catch (error) {
    throw error
  }
}

export const getProduct = async (id) => {
  try {
    const response = await api.get(`/api/products/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateProduct = async (id, data) => {
  try {
    const response = await api.put(`/api/products/${id}`, data)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/api/products/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getAllProductCategories = async () => {
  try {
    const response = await api.get('/api/categories')
    return response.data
  } catch (error) {
    throw error
  }
}

// Import functions
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
    return { used: 0, limit: 199, remaining: 199 };
  }
};

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

// PRICE IMPORT FUNCTIONS - USING AXIOS CONSISTENTLY

/**
 * Bulk import prices from Excel/CSV file
 */
export const bulkImportPrices = async (formData) => {
  try {
    console.log('📤 Sending price import request to /api/prices/bulk-import...');
    
    // Debug: Log FormData contents
    console.log('📋 FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (key === 'priceFile') {
        console.log(`  ${key}:`, value.name, `(size: ${value.size} bytes)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const response = await api.post('/api/prices/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 120000, // 2 minutes timeout for large files
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📤 Upload Progress: ${percentCompleted}%`);
      }
    });
    
    console.log('✅ Price import successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Price import failed:', error);
    
    // More detailed error information
    if (error.response) {
      console.error('📊 Error response data:', error.response.data);
      console.error('🔧 Error response status:', error.response.status);
      console.error('📝 Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('🔌 No response received:', error.request);
    }
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to import prices - check console for details';
    throw new Error(errorMessage);
  }
};

/**
 * Get prices by seller
 */
export const getPricesBySeller = async (sellerName, params = {}) => {
  try {
    const response = await api.get(`/api/prices/seller/${sellerName}`, { params });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch prices';
    throw new Error(errorMessage);
  }
};

/**
 * Get product with prices
 */
export const getProductWithPrices = async (productId, includeOutOfStock = false) => {
  try {
    const response = await api.get(`/api/products/${productId}/prices`, {
      params: { includeOutOfStock }
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch product with prices';
    throw new Error(errorMessage);
  }
};

/**
 * Get all sellers
 */
export const getPriceSellers = async () => {
  try {
    const response = await api.get('/api/prices/sellers');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch sellers';
    throw new Error(errorMessage);
  }
};

/**
 * Test price API connection
 */
export const testPriceAPI = async () => {
  try {
    const response = await api.get('/api/prices/test');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Price API is not available';
    throw new Error(errorMessage);
  }
};

// Export all functions as default object for backward compatibility
const ProductAPI = {
  importProductFromIcecat,
  getImportedProducts,
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getAllProductCategories,
  importProductsFromExcel,
  getImportJobs,
  importFromProductForImport,
  getImportJobStatus,
  getDailyUsage,
  bulkImportProducts,
  getProductsForImport,
  bulkImportPrices,
  getPricesBySeller,
  getProductWithPrices,
  getPriceSellers,
  testPriceAPI
};

export default ProductAPI;