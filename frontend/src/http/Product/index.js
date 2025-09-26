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

export const getImportedProducts = async () => {
  try {
    const response = await api.get('/api/products/imports')
    return response.data
  } catch (error) {
    throw error
  }
}

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

export const getImportJobStatus = async (jobId) => {
  try {
    const response = await api.get(`/api/products/import-jobs/${jobId}`)
    return response.data
  } catch (error) {
    throw error
  }
}

// src/http/Product.js
// import axios from 'axios'

// const API_BASE_URL = 'http://localhost:5000' // Your backend URL

// // Create axios instance with default config
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 30000, // 30 seconds timeout
// })

// // Add response interceptor for better error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message)
//     return Promise.reject(error)
//   },
// )

// // ===== PRODUCT FOR IMPORT ROUTES =====

// // Create a product for import
// export const createProductForImport = async (data) => {
//   try {
//     const response = await api.post('/api/productforimports', data)
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create product for import'
//     throw new Error(errorMessage)
//   }
// }

// // Bulk create products for import
// export const bulkCreateProductsForImport = async (products) => {
//   try {
//     const response = await api.post('/api/productforimports/bulk', { products })
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to bulk create products for import'
//     throw new Error(errorMessage)
//   }
// }

// // Import from external API
// export const importFromExternalAPI = async (distributor, brand) => {
//   try {
//     const response = await api.post('/api/productforimports/import-external', {
//       distributor,
//       brand,
//     })
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to import from external API'
//     throw new Error(errorMessage)
//   }
// }

// // Get all products for import with pagination and filters
// export const getAllProductsForImport = async (params = {}) => {
//   try {
//     const response = await api.get('/api/productforimports', { params })
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// // Get statistics
// export const getImportStats = async () => {
//   try {
//     const response = await api.get('/api/productforimports/stats')
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// // Search products
// export const searchProductsForImport = async (query) => {
//   try {
//     const response = await api.get('/api/productforimports/search', {
//       params: { q: query },
//     })
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// // ===== NEW STATUS-BASED ROUTES =====

// // Get products by status with pagination
// export const getProductsByStatus = async (status, page = 1, limit = 10) => {
//   try {
//     const response = await api.get('/api/productforimports/status', {
//       params: { status, page, limit },
//     })
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to get products by status'
//     throw new Error(errorMessage)
//   }
// }

// // Get exact count of products by status
// export const getExactCountByStatus = async (count, status = 'inactive') => {
//   try {
//     const response = await api.get('/api/productforimports/status/exact', {
//       params: { count, status },
//     })
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to get exact count by status'
//     throw new Error(errorMessage)
//   }
// }

// // Get filtered products by status with additional filters
// export const getProductsByStatusWithFilters = async (filters = {}) => {
//   try {
//     const response = await api.get('/api/productforimports/status/filtered', {
//       params: filters,
//     })
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to get filtered products by status'
//     throw new Error(errorMessage)
//   }
// }

// // ===== CRUD OPERATIONS =====

// // Get product by ID
// export const getProductForImportById = async (id) => {
//   try {
//     const response = await api.get(`/api/productforimports/${id}`)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// // Update product for import
// export const updateProductForImport = async (id, data) => {
//   try {
//     const response = await api.put(`/api/productforimports/${id}`, data)
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update product for import'
//     throw new Error(errorMessage)
//   }
// }

// // Delete product for import
// export const deleteProductForImport = async (id) => {
//   try {
//     const response = await api.delete(`/api/productforimports/${id}`)
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to delete product for import'
//     throw new Error(errorMessage)
//   }
// }

// // Bulk update status
// export const bulkUpdateStatusForImport = async (productIds, status) => {
//   try {
//     const response = await api.patch('/api/productforimports/bulk-status', {
//       productIds,
//       status,
//     })
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to bulk update status'
//     throw new Error(errorMessage)
//   }
// }

// // ===== LEGACY PRODUCT ROUTES (KEEPING FOR BACKWARD COMPATIBILITY) =====

// export const importProductFromIcecat = async (data) => {
//   try {
//     const response = await api.post('/api/products/import', data)
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to import product'
//     throw new Error(errorMessage)
//   }
// }

// export const getImportedProducts = async () => {
//   try {
//     const response = await api.get('/api/products/imports')
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const createProduct = async (formData) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/api/products`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     })
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const getProducts = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/products`)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const getProduct = async (id) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/products/${id}`)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const updateProduct = async (id, data) => {
//   try {
//     const response = await axios.put(`${API_BASE_URL}/api/products/${id}`, data)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const deleteProduct = async (id) => {
//   try {
//     const response = await axios.delete(`${API_BASE_URL}/api/products/${id}`)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const getAllProductCategories = async () => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/api/categories`)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// // Excel import and job status functions
// export const importProductsFromExcel = async (data) => {
//   try {
//     const response = await api.post('/api/products/import-excel', data)
//     return response.data
//   } catch (error) {
//     const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to import products from Excel'
//     throw new Error(errorMessage)
//   }
// }

// export const getImportJobs = async () => {
//   try {
//     const response = await api.get('/api/products/import-jobs')
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }

// export const getImportJobStatus = async (jobId) => {
//   try {
//     const response = await api.get(`/api/products/import-jobs/${jobId}`)
//     return response.data
//   } catch (error) {
//     throw error
//   }
// }
