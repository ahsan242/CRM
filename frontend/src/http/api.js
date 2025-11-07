
// src/http/api.js
import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BACKEND_BASE,
  withCredentials: false,
  timeout: 30000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
  (config) => {
    // Log all requests for debugging
    console.log('🚀 Making API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data
    });

    // Attach authorization token
    try {
      const authData = localStorage.getItem("auth");
      if (authData) {
        const parsed = JSON.parse(authData);
        // Try different possible token locations
        const token = parsed?.token || parsed?.accessToken || parsed?.data?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Token attached to request');
        }
      }
    } catch (err) {
      console.error('❌ Error parsing auth data:', err);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('❌ API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          console.log('🔐 401 Unauthorized - Clearing auth data');
          localStorage.removeItem("auth");
          // Don't redirect automatically - let the component handle it
          break;
        
        case 403:
          console.log('🚫 403 Forbidden - Access denied');
          break;
        
        case 404:
          console.log('🔍 404 Not Found - Invalid endpoint');
          break;
        
        case 500:
          console.log('💥 500 Server Error - Backend issue');
          break;
          
        default:
          console.log(`⚠️ HTTP ${error.response.status} Error`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('🌐 Network Error - No response received:', error.request);
    } else {
      // Something else happened
      console.error('⚡ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;