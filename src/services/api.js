import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzYzNTY0NzY2LCJleHAiOjE3NjM1NjgzNjZ9.8Pk4hXTzlppR49K6_RHwQo8QTdRrdngUMCIk76-XYro",

    "Content-Type": "application/json",
  },
  withCredentials: false,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("인증 만료 또는 실패");
    }
    return Promise.reject(error);
  },
);

export default api;
