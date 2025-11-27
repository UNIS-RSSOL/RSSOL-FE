import axios from "axios";

// 환경변수가 없으면 에러를 발생시켜 개발자가 설정하도록 함
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  console.error(
    "❌ VITE_API_URL 환경변수가 설정되지 않았습니다.\n" +
      "프로젝트 루트에 .env.development 또는 .env.production 파일을 생성하고\n" +
      "VITE_API_URL=your-api-url 형태로 설정하세요."
  );
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzYzNTY0NzY2LCJleHAiOjE3NjM1NjgzNjZ9.8Pk4hXTzlppR49K6_RHwQo8QTdRrdngUMCIk76-XYro",

    "Content-Type": "application/json",
  },
  withCredentials: false,
});

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
