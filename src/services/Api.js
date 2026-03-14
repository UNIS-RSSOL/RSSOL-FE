import axios from "axios";
import { refreshToken } from "./AuthService";

//axios 인스턴스. 이후 주소 쓸 때는 api/ 이후 부터 쓰면 됨
const api = axios.create({
  baseURL: "https://api.rssolplan.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 갱신 중인지 추적 (무한 루프 방지)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

//요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log("✅ Authorization 헤더 추가됨:", config.url);
    } else {
      console.warn("⚠️ accessToken 없음:", config.url);
    }
    // accessToken이 없어도 일단 요청은 보냄 (응답 인터셉터에서 처리)
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
  async (error) => {
    const originalRequest = error.config;

    // 403 또는 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (
      (error.response?.status === 403 || error.response?.status === 401) &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh // refresh-token API는 제외
    ) {
      console.warn(
        `⚠️ ${error.response?.status} 에러 발생:`,
        originalRequest.url
      );
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (!refreshTokenValue) {
        // refreshToken도 없으면 로그인 페이지로
        processQueue(error, null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 시도
        await refreshToken();
        const newAccessToken = localStorage.getItem("accessToken");

        if (newAccessToken) {
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          isRefreshing = false;
          return api(originalRequest);
        } else {
          throw new Error("토큰 갱신 실패");
        }
      } catch (refreshError) {
        // 토큰 갱신 실패
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
