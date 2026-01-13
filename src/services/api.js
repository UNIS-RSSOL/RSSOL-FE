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
      // refreshToken 요청 실패 시에만 logout 호출
      // 단, refreshToken이 없는 경우는 이미 로그아웃 상태이므로 중복 호출 방지
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await logout();
      } else {
        // refreshToken이 없으면 이미 로그아웃 상태
        localStorage.removeItem("accessToken");
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }

    // 2. 401/403 에러 발생 시
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      // ✅ 중요: 리프레시 토큰이 아예 없으면 갱신 시도 없이 바로 중단
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // refreshToken이 없으면 토큰 갱신 불가능
        // 로그아웃 처리하지 않고 에러만 반환 (로그인 페이지로 리다이렉트는 상위에서 처리)
        console.warn("토큰 인증 실패 (403) - refreshToken이 없어 토큰 갱신 불가");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log("토큰 인증 실패 (403) - 토큰 갱신 시도");
        const tokenData = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("토큰 갱신 실패 - 로그아웃 처리");
        // refreshToken이 있는데 갱신 실패한 경우에만 logout 호출
        await logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
