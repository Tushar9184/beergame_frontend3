import axios from "axios";


export const BASE_URL=`https://the-beer-game-backend.onrender.com`;
export const myAxios= axios.create({
    baseURL:BASE_URL,
    
});

// Request interceptor — attach JWT token to every request
myAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 Unauthorized globally
// When the JWT expires, instead of the app silently breaking,
// we clear the session and redirect to login automatically.
myAxios.interceptors.response.use(
  (response) => response, // Pass through successful responses unchanged
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and send to login
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error); // Still propagate error to the call site
  }
);

