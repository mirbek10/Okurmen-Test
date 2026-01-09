import axios from "axios";

// Создаём экземпляр axios
export const axiosUser = axios.create({
  baseURL: "https://beckend-test-sqyj.onrender.com/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});


axiosUser.interceptors.request.use((config) => {

  return config;
}, (error) => {
  return Promise.reject(error);
});

