// src/connect_to_api/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: false, // plus besoin si on envoie le JWT dans l'header
});

// Intercepteur pour ajouter le token dans les headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
