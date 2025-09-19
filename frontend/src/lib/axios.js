import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001", 
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach JWT token if exists
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/login";
      }
      if (error.response.status === 403) {
        console.error("❌ Forbidden");
      }
    } else if (error.request) {
      console.error("❌ No response from backend. Check server.");
    } else {
      console.error("❌ Axios error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
