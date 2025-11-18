import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// apiClient.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         // 예: 401 Unauthorized 오류 시 로그아웃 처리
//         if (error.response && error.response.status === 401) {
//             console.error('인증 만료 또는 실패');
//             // 예시: 로그아웃 로직 (history.push('/login'))
//         }
//         return Promise.reject(error);
//     }
// );

export default apiClient;
