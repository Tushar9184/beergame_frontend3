import axios from "axios";


export const BASE_URL=`https://the-beer-game-backend.onrender.com`;
export const myAxios= axios.create({
    baseURL:BASE_URL,
    
});
myAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

