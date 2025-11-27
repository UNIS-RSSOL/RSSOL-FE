import api from "./api"; // 수정된 Axios 인스턴스 가져오기

/**
 * 체크용 로그인 - 개발 토큰 발급
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{success: boolean, message: string, data: string}>}
 */
export const getDevToken = async (email) => {
  try {
    const response = await api.post(
      "/auth/dev-token",
      { email: email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Dev token 요청 실패:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
