// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // FastAPI backend root
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Optional: 10s timeout for resilience
});

// Optional: Add token if you implement auth later
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Optional: Log errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios error:", error.message);
    return Promise.reject(error);
  }
);

export default api;
