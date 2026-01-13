import axios from "axios";
import { refreshToken, logout } from "./authService";

const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

const api = axios.create({
  baseURL: "https://connecti.store",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // 토큰 갱신 요청은 건너뜀
    if (config._skipAuthRefresh) {
      return config;
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
    } else {
      console.error("accessToken 없음");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. 토큰 갱신 요청 자체가 실패한 경우 처리
    if (originalRequest.url.includes("/api/auth/refresh-token")) {
      await logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 2. 401/403 에러 발생 시
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      // ✅ 중요: 리프레시 토큰이 아예 없으면 갱신 시도 없이 바로 중단
      if (!localStorage.getItem("refreshToken")) {
        // 필요 시 여기서 logout() 호출 후 return
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const tokenData = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        await logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
