import axios from "axios";

const api = axios.create({
  baseURL: "/api/proxy",
  withCredentials: true,
});

export default api;
