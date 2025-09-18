
// src/http/api.js
import axios from "axios";

const BACKEND_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BACKEND_BASE,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Auto attach token (same token location as httpClient)
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token || parsed?.accessToken || null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {}
  return config;
});

export default api;
