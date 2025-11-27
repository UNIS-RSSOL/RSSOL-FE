import api from "./api";

const KAKAO_AUTH_BASE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_CLIENT_ID = "3ddfc329270e2ce7e4ab45f3fcca3891";
const LOCAL_REDIRECT_URI = "http://localhost:8080/api/auth/kakao/callback";
const PROD_REDIRECT_URI = "https://connecti.store/api/auth/kakao/callback";

const resolveRedirectUri = () =>
  import.meta.env?.PROD ? PROD_REDIRECT_URI : LOCAL_REDIRECT_URI;

/**
 * 카카오 인증 페이지 URL을 생성합니다.
 * @returns {string}
 */
export const getKakaoAuthorizeUrl = () => {
  const redirectUri = encodeURIComponent(resolveRedirectUri());
  return `${KAKAO_AUTH_BASE_URL}?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code`;
};

/**
 * 카카오 인증 페이지로 이동합니다.
 */
export const goToKakaoLogin = () => {
  window.location.assign(getKakaoAuthorizeUrl());
};

/**
 * 카카오 콜백 코드로 백엔드에 로그인/회원가입을 요청합니다.
 * @param {string} code - 카카오에서 전달된 authorization code
 * @returns {Promise<{
 *   accessToken: string;
 *   refreshToken: string;
 *   userId: number;
 *   isNewUser: boolean;
 *   username: string;
 *   phoneNumber?: string;
 *   provider: "kakao";
 *   providerId: string;
 * }>}
 */
export const completeKakaoLogin = async (code) => {
  if (!code) {
    throw new Error("카카오 인증 코드가 필요합니다.");
  }

  const response = await api.get("/api/auth/kakao/callback", {
    params: { code },
  });

  return response.data;
};
