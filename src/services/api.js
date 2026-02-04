import axios from "axios";
import { refreshToken } from "./AuthService";

//axios 인스턴스. 이후 주소 쓸 때는 api/ 이후 부터 쓰면 됨
const api = axios.create({
  baseURL: "https://connecti.store/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

//요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const newAccessToken = refreshToken(refreshToken);
        config.headers.Authorization = `Bearer ${newAccessToken.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    console.log("요청 인터셉터 에러: ", error);
    return Promise.reject(error);
  },
);

//응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
