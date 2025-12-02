import axios from "axios";

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
      console.log(`✅ API 요청 성공: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // 에러 상세 로깅
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      console.error(`❌ API 에러 응답: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
      
      if (error.response.status === 401) {
        console.error("인증 만료 또는 실패");
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함 (네트워크 에러, CORS 등)
      console.error(`❌ API 네트워크 에러: ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`, {
        message: error.message,
        code: error.code,
        hint: "로컬 프론트에서 배포 백엔드로 요청 시 CORS 문제일 수 있습니다.",
      });
    } else {
      // 요청 설정 중 에러
      console.error("❌ API 요청 설정 에러:", error.message);
    }
    
    return Promise.reject(error);
  },
);

export default api;
