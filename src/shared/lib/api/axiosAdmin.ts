import axios from "axios";
import Cookies from "js-cookie";
// Создаём экземпляр axios
export const axiosAdmin = axios.create({
  baseURL: "https://beckend-test-sqyj.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});


axiosAdmin.interceptors.request.use((config) => {

    const token = Cookies.get("adminToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    
  }
  

  return config;
}, (error) => {
  return Promise.reject(error);
});

