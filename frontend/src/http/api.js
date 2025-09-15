// // src/http/api.js
// import axios from "axios";

// const api = axios.create({
//    baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// export default api;

// src/http/api.js

//.................


// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });

// // ✅ Automatically attach JWT token to all requests
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token"); // you store token on login
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;
 
//.................................

// src/http/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // 👈 point to your backend
  withCredentials: true, // only if you’re using cookies
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // clear token
      window.location.href = "/auth/signin"; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
