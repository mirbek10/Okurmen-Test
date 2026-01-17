import axios from "axios";
import Cookies from "js-cookie";

// Создаём экземпляр axios
export const axiosUser = axios.create({
  baseURL: "https://beckend-test-sqyj.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});


axiosUser.interceptors.request.use((config) => {
  const token = Cookies.get('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

