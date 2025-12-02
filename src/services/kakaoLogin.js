/**
 * 카카오 로그인 서비스
 * 
 * 플로우:
 * 1. 사용자가 카카오 로그인 버튼 클릭
 * 2. 카카오 인증 페이지로 이동 (redirect_uri는 프론트엔드 콜백 URL)
 * 3. 카카오가 프론트엔드 콜백 URL로 code를 전달
 * 4. 프론트엔드가 code를 받아서 백엔드로 전달
 * 5. 백엔드가 code를 받아서 카카오 토큰 교환 및 사용자 정보 처리
 * 6. 프론트엔드가 백엔드 응답을 받아서 저장하고 적절한 페이지로 이동
 */

import api from "./api.js";

const KAKAO_AUTH_BASE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_CLIENT_ID = "3ddfc329270e2ce7e4ab45f3fcca3891";

// 프론트엔드 콜백 URL (카카오가 리다이렉트할 주소)
const LOCAL_REDIRECT_URI = "http://localhost:5173/auth/kakao/callback";
const PROD_REDIRECT_URI = "https://connecti.store/auth/kakao/callback";

const TOKEN_REFRESH_PATH = "/api/auth/token/refresh";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * 프론트엔드 콜백 URL을 반환합니다 (카카오 OAuth redirect_uri)
 */
const getRedirectUri = () => {
  // 프로덕션 환경 체크: Vite의 PROD 모드 또는 connecti.store 도메인 사용 시
  const isProduction = 
    import.meta.env.PROD || 
    window.location.hostname === 'connecti.store' ||
    window.location.hostname.includes('connecti.store');
  
  return isProduction ? PROD_REDIRECT_URI : LOCAL_REDIRECT_URI;
};

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
 * redirect_uri는 프론트엔드 콜백 URL을 사용합니다.
 * @returns {string}
 */
export const getKakaoAuthorizeUrl = () => {
  const redirectUri = encodeURIComponent(getRedirectUri());
  // prompt=login 파라미터를 추가하여 항상 로그인 페이지를 보여줍니다
  return `${KAKAO_AUTH_BASE_URL}?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&prompt=login`;
};

/**
 * 카카오 인증 페이지로 이동합니다.
 */
export const goToKakaoLogin = (e) => {
  // 이벤트가 전달된 경우 기본 동작 방지
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  const url = getKakaoAuthorizeUrl();
  console.log("카카오 로그인 버튼 클릭됨");
  console.log("카카오 로그인 URL:", url);
  
  // 명시적으로 카카오 인증 페이지로 이동
  window.location.href = url;
};

/**
 * 백엔드에서 전달받은 세션 정보를 저장합니다.
 * @param {Object} session - 백엔드에서 전달받은 세션 정보
 */
export const handleKakaoSession = (session) => {
  if (!session) {
    throw new Error("세션 정보가 없습니다.");
  }

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
