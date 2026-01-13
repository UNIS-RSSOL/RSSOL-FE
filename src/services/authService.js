import api from "./api.js";
import axios from "axios";

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
    let normalizedRefreshToken = null;

    // 1. response.data가 직접 토큰 문자열인 경우
    if (typeof response.data === "string") {
      normalizedToken = response.data;
    }
    // 2. response.data.accessToken인 경우 (카카오 로그인과 동일한 형식)
    else if (response.data?.accessToken) {
      normalizedToken = response.data.accessToken;
      normalizedRefreshToken = response.data.refreshToken || null;
    }
    // 3. response.data.data가 토큰인 경우
    else if (response.data?.data) {
      const rawData = response.data.data;
      if (typeof rawData === "string") {
        normalizedToken = rawData;
      } else if (rawData?.accessToken) {
        normalizedToken = rawData.accessToken;
        normalizedRefreshToken = rawData.refreshToken || null;
      } else if (rawData?.token) {
        normalizedToken = rawData.token;
        normalizedRefreshToken = rawData.refreshToken || null;
      }
    }
    // 4. response.data.token인 경우
    else if (response.data?.token) {
      normalizedToken = response.data.token;
      normalizedRefreshToken = response.data.refreshToken || null;
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
      refreshToken: normalizedRefreshToken,
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
 * @param {string} hireDate
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
export const onboardingStaff = async (
  storeCode,
  bankId,
  accountNumber,
  hireDate,
) => {
  try {
    const response = await api.post("/api/auth/onboarding", {
      role: "STAFF",
      storeCode,
      bankId,
      accountNumber,
      hireDate,
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
 * @param {string} hireDate
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
  hireDate,
) => {
  try {
    const response = await api.post("/api/auth/onboarding", {
      role: "OWNER",
      name,
      address,
      phoneNumber,
      businessRegistrationNumber,
      hireDate,
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

//토큰 갱신
export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    const response = await api.post(
      "/api/auth/refresh-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
        _skipAuthRefresh: true,
      },
    );

    if (!response.data || !response.data.accessToken) {
      throw new Error("Invalid token response format");
    }

    localStorage.setItem("accessToken", response.data.accessToken);
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken);
    }

    return response.data;
  } catch (error) {
    // refreshToken이 없는 경우는 특별히 처리하지 않음 (상위에서 처리)
    // refreshToken이 있는데 갱신 실패한 경우만 에러 throw
    throw error;
  }
}

//로그아웃
export async function logout() {
  try {
    const token = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    
    // accessToken 또는 refreshToken이 있으면 서버에 로그아웃 요청
    if (token || refreshToken) {
      try {
        await api.post("/api/auth/logout", {}, { _skipAuthRefresh: true });
      } catch (error) {
        // 로그아웃 API 실패해도 클라이언트에서는 로그아웃 처리 진행
        // 403 에러는 이미 로그아웃된 상태일 수 있으므로 무시
        if (error.response?.status !== 403) {
          console.log("로그아웃 API 호출 실패: ", error);
        }
      }
    }
  } catch (error) {
    console.log("로그아웃 처리 중 에러: ", error);
  } finally {
    // 항상 localStorage 정리
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }
}
