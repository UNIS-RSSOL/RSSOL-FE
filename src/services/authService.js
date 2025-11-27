// API base URL - 환경 변수로 관리하거나 필요시 수정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://connecti.store";

/**
 * 체크용 로그인 - 개발 토큰 발급
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{success: boolean, message: string, data: string}>}
 */
export const getDevToken = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/dev-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Dev token 요청 실패:", error);
    throw error;
  }
};
