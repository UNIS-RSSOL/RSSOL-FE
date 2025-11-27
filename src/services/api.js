import axios from "axios";

<<<<<<< HEAD
// 환경변수가 없으면 에러를 발생시켜 개발자가 설정하도록 함
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    "❌ VITE_API_URL 환경변수가 설정되지 않았습니다.\n" +
      "프로젝트 루트에 .env.development 또는 .env.production 파일을 생성하고\n" +
      "VITE_API_URL=your-api-url 형태로 설정하세요."
  );
}
=======
const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};
>>>>>>> dd24344634d47545b243a9af99b6b2847b10b6d9

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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
