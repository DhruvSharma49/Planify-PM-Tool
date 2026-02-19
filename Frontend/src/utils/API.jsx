import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true // crucial to send cookies
});

// Refresh access token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      await axios.post("http://localhost:3000/api/auth/refresh", {}, { withCredentials: true });
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
