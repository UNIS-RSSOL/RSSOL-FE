import axios from "axios";

// API base URL - 환경 변수로 관리
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error(
    "❌ VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.\n" +
      "프로젝트 루트에 .env.development 또는 .env.production 파일을 생성하고\n" +
      "VITE_API_BASE_URL=your-api-url 형태로 설정하세요."
  );
}

// 로그인 API용 axios 인스턴스 (인증 없이 사용)
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

/**
 * 체크용 로그인 - 개발 토큰 발급
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{success: boolean, message: string, data: string}>}
 */
export const getDevToken = async (email) => {
  try {
    const response = await authApi.post("/auth/dev-token", {
      email: email,
    });

    return response.data;
  } catch (error) {
    console.error("Dev token 요청 실패:", error);
    
    // axios 에러 처리
    if (error.response) {
      // 서버가 응답했지만 상태 코드가 에러 범위
      const errorMessage = error.response.data?.message || 
                          `HTTP error! status: ${error.response.status}`;
      throw new Error(errorMessage);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      throw new Error("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
    } else {
      // 요청 설정 중 오류 발생
      throw new Error(error.message || "로그인 요청 중 오류가 발생했습니다.");
    }
  }
};

