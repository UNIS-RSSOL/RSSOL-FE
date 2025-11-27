import api from "./api"; // 수정된 Axios 인스턴스 가져오기

/**
 * 체크용 로그인 - 개발 토큰 발급
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{success: boolean, message: string, data: string}>}
 */
export const getDevToken = async (email) => {
  try {
    // 1. api 인스턴스를 사용하여 POST 요청을 보냅니다.
    // baseURL이 이미 api 인스턴스에 설정되어 있으므로 경로만 입력합니다.
    // Axios는 두 번째 인수인 객체를 자동으로 JSON.stringify() 합니다.
    const response = await api.post("/auth/dev-token", {
      email: email,
    });

    // 2. Axios는 2xx 응답인 경우에만 성공으로 처리하며,
    // response.data에 파싱된 JSON 객체가 바로 들어있습니다.
    return response.data;
  } catch (error) {
    // 3. Axios는 4xx/5xx 응답인 경우 자동으로 에러를 throw 합니다.
    // error.response를 통해 서버가 보낸 상세 응답 내용을 확인할 수 있습니다.
    console.error("Dev token 요청 실패:", error.response || error.message);
    throw error;
  }
};

// 참고: API_BASE_URL 상수는 더 이상 이 함수에서 필요하지 않습니다.
