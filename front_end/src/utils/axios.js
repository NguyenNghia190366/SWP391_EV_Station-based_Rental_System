import axios from "axios";

const api = axios.create({
  baseURL: "https://68e62cc921dd31f22cc4769d.mockapi.io/api/ev", // ✅ Bỏ /users
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("🚀 Request:", config.method.toUpperCase(), config.url);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;
