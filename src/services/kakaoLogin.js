import api from "./api";

const KAKAO_AUTH_BASE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_CLIENT_ID = "3ddfc329270e2ce7e4ab45f3fcca3891";
const LOCAL_REDIRECT_URI = "http://localhost:8080/api/auth/kakao/callback";
const PROD_REDIRECT_URI = "https://connecti.store/api/auth/kakao/callback";
const KAKAO_CALLBACK_PATH = "/api/auth/kakao/callback";
const TOKEN_REFRESH_PATH = "/api/auth/token/refresh";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const resolveRedirectUri = () =>
  import.meta.env?.PROD ? PROD_REDIRECT_URI : LOCAL_REDIRECT_URI;

const persistSession = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

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
 *   email: string;
 *   profileImageUrl?: string;
 *   provider: "kakao";
 *   providerId: string;
 * }>}
 */
export const completeKakaoLogin = async (code) => {
  if (!code) {
    throw new Error("카카오 인증 코드가 필요합니다.");
  }

  const response = await api.post(KAKAO_CALLBACK_PATH, { code });
  const session = response.data;

  persistSession(session);

  return session;
};

/**
 * Refresh Token으로 Access Token을 재발급받습니다.
 * @returns {Promise<string>} 새 Access Token
 */
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("저장된 Refresh Token이 없습니다.");
  }

  const response = await api.post(
    TOKEN_REFRESH_PATH,
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  const { accessToken } = response.data ?? {};

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  return accessToken;
};
