import axios from "axios";
import { refreshToken } from "./authService";

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
    const token = getAuthToken(); // 저장소에서 토큰을 가져옵니다.

    if (token) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === "/api/auth/refresh-token") {
        console.log("리프레시 토큰 만료 - 로그인 페이지로 이동");
        await logout();
        window.location.href = "/";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log("액세스 토큰 만료 - 토큰 갱신 시도");
        const newTokens = await refreshToken();

        if (newTokens && newTokens.accessToken) {
          localStorage.setItem("accessToken", newTokens.accessToken);

          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

          return api(originalRequest);
        } else {
          throw new Error("토큰 갱신 실패: 유표하지 않은 응답 형식");
        }
      } catch (refreshError) {
        console.error("토큰 갱신 실패:", refreshError);
        await logout();
        window.location.href = "/";
        return Promise.reject(error);
      }
    }
    // 에러 상세 로깅
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      console.error(
        `❌ API 에러 응답: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        },
      );
    }

    return Promise.reject(error);
  },
);

export default api;
