import api from "./api"; // 수정된 Axios 인스턴스 가져오기

/**
 * 체크용 로그인 - 개발 토큰 발급
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{success: boolean, message: string, data: string}>}
 */
export const getDevToken = async (email) => {
  try {
    const response = await api.post("/auth/dev-token", { email });
    const { success = true, message = "", data: rawData } = response.data ?? {};

    const normalizedToken =
      typeof rawData === "string"
        ? rawData
        : rawData?.accessToken || rawData?.token || null;

    if (!normalizedToken) {
      throw new Error("발급된 토큰을 확인할 수 없습니다.");
    }

    return {
      success,
      data: normalizedToken,
      message,
    };
  } catch (error) {
    console.error(
      "Dev token 요청 실패:",
      error.response?.data || error.message,
    );
    throw error;
  }
};
