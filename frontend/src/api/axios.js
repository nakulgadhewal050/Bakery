// src/api/axios.js
import axios from "axios";

const fallbackBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api"; // Default to same-origin API path (works with local Vite proxy and deployed rewrites)

console.log("API baseURL:", fallbackBaseUrl);

const api = axios.create({
  // Use environment URL in production, local proxy in development (Vite), or hard-coded backend fallback.
  baseURL: fallbackBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Check all possible token storage keys
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("userToken") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;