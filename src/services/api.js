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
  (response) => {
    // 성공 응답 로깅 (개발 환경에서만)
    if (import.meta.env.DEV) {
      console.log(
        `✅ API 요청 성공: ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.status,
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 이미 재시도한 요청이거나 토큰 갱신 요청 자체는 건너뜀
    if (
      originalRequest._retry ||
      originalRequest.url === "/api/auth/refresh-token"
    ) {
      // 토큰 갱신 요청이 실패한 경우 (401/403) → 로그아웃 처리
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        originalRequest.url === "/api/auth/refresh-token"
      ) {
        console.error("❌ 토큰 갱신 요청 실패 - 로그아웃 처리");
        await logout();
        // 절대 경로로 리다이렉트하여 /null/ 문제 방지
        window.location.href = window.location.origin + "/login";
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }

    // 401 또는 403 에러 처리 (토큰 만료/위조/없음)
    if (error.response?.status === 401 || error.response?.status === 403) {
      originalRequest._retry = true;

      try {
        console.log(
          `🔄 토큰 인증 실패 (${error.response?.status}) - 토큰 갱신 시도`,
        );
        const tokenData = await refreshToken();

        // 새 토큰으로 원본 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ 토큰 갱신 실패 - 로그아웃 처리", refreshError);
        await logout();
        // 절대 경로로 리다이렉트하여 /null/ 문제 방지
        window.location.href = window.location.origin + "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
