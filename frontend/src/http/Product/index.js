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
