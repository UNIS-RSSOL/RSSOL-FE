import api from "./api.js";

/**
 * 체크용 로그인 - 개발 토큰 발급
 * @param {string} email - 사용자 이메일
 * @returns {Promise<{success: boolean, message: string, data: string}>}
 */
export const getDevToken = async (email) => {
  try {
    const response = await api.post("/api/auth/dev-token", { email });

    // 디버깅: 응답 전체 구조 확인
    console.log("Dev token 응답 전체:", response.data);

    // 다양한 응답 형식 지원
    let normalizedToken = null;

    // 1. response.data가 직접 토큰 문자열인 경우
    if (typeof response.data === "string") {
      normalizedToken = response.data;
    }
    // 2. response.data.accessToken인 경우 (카카오 로그인과 동일한 형식)
    else if (response.data?.accessToken) {
      normalizedToken = response.data.accessToken;
    }
    // 3. response.data.data가 토큰인 경우
    else if (response.data?.data) {
      const rawData = response.data.data;
      if (typeof rawData === "string") {
        normalizedToken = rawData;
      } else if (rawData?.accessToken) {
        normalizedToken = rawData.accessToken;
      } else if (rawData?.token) {
        normalizedToken = rawData.token;
      }
    }
    // 4. response.data.token인 경우
    else if (response.data?.token) {
      normalizedToken = response.data.token;
    }

    if (!normalizedToken) {
      console.error("토큰을 찾을 수 없습니다. 응답 구조:", response.data);
      throw new Error(
        "발급된 토큰을 확인할 수 없습니다. 응답: " +
          JSON.stringify(response.data),
      );
    }

    return {
      success: true,
      data: normalizedToken,
      message: response.data?.message || "",
    };
  } catch (error) {
    console.error(
      "Dev token 요청 실패:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * 온보딩 - 알바생 역할 등록
 * @param {string} storeCode
 * @param {number} bankId
 * @param {string} accountNumber
 * @returns {Promise<{
 *   userId: number;
 *   userStoreId: number;
 *   storeId: number;
 *   position: string;
 *   employmentStatus: string;
 *   storeCode: string;
 *   name: string;
 *   address: string;
 *   phoneNumber: string;
 *   businessRegistrationNumber: string;
 *   bankId: number;
 *   bankName: string;
 *   accountNumber: string;
 * }>}
 */
export const onboardingStaff = async (storeCode, bankId, accountNumber) => {
  try {
    const response = await api.post("/api/auth/onboarding", {
      role: "STAFF",
      storeCode,
      bankId,
      accountNumber,
    });
    return response.data;
  } catch (error) {
    console.error(
      "온보딩(알바생) 요청 실패:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * 온보딩 - 사장님 역할 등록
 * @param {string} name
 * @param {string} address
 * @param {string} phoneNumber
 * @param {string} businessRegistrationNumber
 * @returns {Promise<{
 *   userId: number;
 *   userStoreId: number;
 *   storeId: number;
 *   position: string;
 *   employmentStatus: string;
 *   storeCode: string;
 *   name: string;
 *   address: string;
 *   phoneNumber: string;
 *   businessRegistrationNumber: string;
 *   bankId: null;
 *   bankName: null;
 *   accountNumber: null;
 * }>}
 */
export const onboardingOwner = async (
  name,
  address,
  phoneNumber,
  businessRegistrationNumber,
) => {
  try {
    const response = await api.post("/api/auth/onboarding", {
      role: "OWNER",
      name,
      address,
      phoneNumber,
      businessRegistrationNumber,
    });
    return response.data;
  } catch (error) {
    console.error(
      "온보딩(사장님) 요청 실패:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

//로그아웃
export async function logout() {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
