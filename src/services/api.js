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
    // refresh-token 요청은 accessToken을 Authorization 헤더에 추가하지 않음
    // (refresh-token 요청은 authService.js에서 직접 refreshToken을 Authorization 헤더에 설정함)
    const isRefreshTokenRequest = config.url === "/api/auth/refresh-token";
    
    if (!isRefreshTokenRequest) {
      const token = getAuthToken(); // 저장소에서 토큰을 가져옵니다.

      if (token) {
        config.headers = config.headers ?? {};
        // 이미 Authorization 헤더가 설정되어 있지 않은 경우에만 추가
        if (!config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }

    // DELETE 요청 시 Content-Type 제거 (일부 서버에서 문제 발생 가능)
    if (config.method?.toLowerCase() === 'delete') {
      // DELETE 요청은 일반적으로 body가 없으므로 Content-Type 제거
      delete config.headers['Content-Type'];
    }

    // 개발 환경에서 요청 정보 로깅 (availabilities 관련 요청만)
    if (import.meta.env.DEV && config.url?.includes('availabilities')) {
      console.log(`🔍 [API 요청] availabilities 관련:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: {
          Authorization: config.headers.Authorization ? 'Bearer ***' : '❌ 토큰 없음',
          'Content-Type': config.headers['Content-Type'] || '없음',
        },
        params: config.params,
      });
      
      // 토큰 확인
      if (!token) {
        console.warn("⚠️ [토큰 확인] accessToken이 localStorage에 없습니다!");
      } else {
        console.log("✅ [토큰 확인] accessToken이 존재합니다 (길이:", token.length, ")");
      }
    }

    // 개발 환경에서 요청 정보 로깅
    if (import.meta.env.DEV && config.method?.toLowerCase() === 'delete') {
      console.log(`🔍 DELETE 요청:`, {
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        headers: {
          Authorization: config.headers.Authorization ? 'Bearer ***' : '없음',
          'Content-Type': config.headers['Content-Type'] || '없음',
        },
      });
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

    // 401 또는 500 에러 처리 (refresh-token이 500을 반환할 수 있음)
    const isAuthError = error.response?.status === 401 || error.response?.status === 500;
    const isRefreshTokenError = originalRequest.url === "/api/auth/refresh-token";
    
    if (isAuthError && !originalRequest._retry) {
      // refresh-token 요청 자체가 실패한 경우
      if (isRefreshTokenError) {
        console.log("❌ 리프레시 토큰 요청 실패 - 로그인 페이지로 이동");
        console.error("에러 상세:", {
          status: error.response?.status,
          data: error.response?.data,
        });
        await logout();
        window.location.href = "/";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        console.log("🔄 액세스 토큰 만료 - 토큰 갱신 시도");
        const response = await refreshToken();

        // 응답 형식: { accessToken: "string" }
        if (response && response.accessToken) {
          localStorage.setItem("accessToken", response.accessToken);

          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

          return api(originalRequest);
        } else {
          throw new Error("토큰 갱신 실패: 유효하지 않은 응답 형식");
        }
      } catch (refreshError) {
        console.error("❌ 토큰 갱신 실패:", refreshError);
        await logout();
        window.location.href = "/";
        return Promise.reject(error);
      }
    }
    // 에러 상세 로깅
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      const isAvailabilityError = error.config?.url?.includes('availabilities');
      const errorLog = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        requestURL: error.config?.url,
        requestMethod: error.config?.method?.toUpperCase(),
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
      };
      
      if (isAvailabilityError) {
        console.error(
          `❌ [API 에러] availabilities 관련 요청 실패:`,
          errorLog,
        );
        
        // 500 에러인 경우 추가 정보
        if (error.response.status === 500) {
          console.error("⚠️ [500 에러 상세] 서버 내부 오류:", {
            requestHeaders: error.config?.headers,
            responseHeaders: error.response.headers,
            responseData: error.response.data,
          });
        }
      } else {
        console.error(
          `❌ API 에러 응답: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          },
        );
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error("❌ [API 에러] 서버 응답 없음:", {
        url: error.config?.url,
        message: error.message,
      });
    }

    return Promise.reject(error);
  },
);

export default api;
