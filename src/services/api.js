import axios from "axios";

const api = axios.create({
  baseURL: 
    import.meta.env.VITE_BACKEND_URL ||
    "https://credit-card-fraud-backend-d1vc.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const tempToken = localStorage.getItem("tempToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (tempToken) {
    config.headers.Authorization = `Bearer ${tempToken}`;
  }

  return config;
});

export default api;
