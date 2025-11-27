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
      // 토큰이 존재하면 Authorization 헤더에 'Bearer <token>' 형식으로 추가
      // 이는 JWT(JSON Web Token) 사용 시 표준 방식입니다.
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
