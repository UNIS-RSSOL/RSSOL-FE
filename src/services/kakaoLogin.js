/**
 * 카카오 로그인 서비스
 * 
 * ✨ 프론트엔드에서 직접 카카오 인증 URL을 생성합니다.
 * 백엔드는 카카오 콜백을 받아 토큰을 발급하고 프론트엔드로 리다이렉트합니다.
 * 
 * 플로우:
 * 1. 사용자가 카카오 로그인 버튼 클릭
 * 2. 프론트엔드가 카카오 인증 URL 생성 (redirect_uri: 백엔드 콜백 URL)
 * 3. 카카오 인증 페이지로 이동
 * 4. 카카오가 백엔드로 code를 전달 (/api/auth/kakao/callback?redirect_uri={프론트 URL})
 * 5. 백엔드가 code를 받아서 카카오 토큰 교환 및 사용자 정보 처리
 * 6. 백엔드가 프론트엔드 redirect_uri로 리다이렉트 (accessToken, refreshToken, userId 전달)
 * 7. 프론트엔드에서 토큰 저장 및 적절한 페이지로 이동
 */

import api from "./api.js";

// 카카오 클라이언트 ID (환경변수에서 가져오거나 직접 설정)
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID || "";

// 백엔드 주소 (항상 배포 주소 사용)
const BACKEND_BASE_URL = "https://connecti.store";

// 백엔드 카카오 콜백 경로
const BACKEND_CALLBACK_PATH = "/api/auth/kakao/callback";

// 프론트엔드 콜백 경로
const FRONTEND_CALLBACK_PATH = "/auth/kakao/callback";

// 개발/배포 환경에 따른 프론트엔드 URL
const getFrontendBaseUrl = () => {
  // 개발 환경 (로컬)
  if (import.meta.env.DEV || window.location.hostname === "localhost") {
    return "http://localhost:5173";
  }
  // 배포 환경 (Vercel)
  return "https://rssol-fe.vercel.app";
};

const TOKEN_REFRESH_PATH = "/api/auth/token/refresh";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

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
 * 프론트엔드 콜백 URL을 생성합니다.
 * 환경에 따라 다른 URL을 반환합니다.
 * 
 * @returns {string} 프론트엔드 콜백 URL
 */
const getFrontendCallbackUrl = () => {
  const frontendBaseUrl = getFrontendBaseUrl();
  return `${frontendBaseUrl}${FRONTEND_CALLBACK_PATH}`;
};

/**
 * 카카오 로그인을 시작합니다.
 * 프론트엔드에서 직접 카카오 인증 URL을 생성하여 이동합니다.
 * 
 * @param {Event} e - 이벤트 객체 (선택사항)
 */
export const goToKakaoLogin = (e) => {
  // 이벤트가 전달된 경우 기본 동작 방지
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 카카오 클라이언트 ID 확인
  if (!KAKAO_CLIENT_ID) {
    console.error("❌ KAKAO_CLIENT_ID가 설정되지 않았습니다. 환경변수 VITE_KAKAO_CLIENT_ID를 확인하세요.");
    alert("카카오 로그인 설정 오류가 발생했습니다. 관리자에게 문의하세요.");
    return;
  }

  // 프론트엔드 콜백 URL 생성
  const frontendRedirectUri = getFrontendCallbackUrl();
  
  // 백엔드 콜백 URL 생성 (프론트 URL을 쿼리 파라미터로 전달)
  const backendCallbackUrl = `${BACKEND_BASE_URL}${BACKEND_CALLBACK_PATH}?redirect_uri=${encodeURIComponent(frontendRedirectUri)}`;
  
  // 카카오 인증 URL 생성
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(backendCallbackUrl)}&response_type=code`;
  
  console.log("카카오 로그인 버튼 클릭됨");
  console.log("프론트엔드 콜백 URL:", frontendRedirectUri);
  console.log("백엔드 콜백 URL:", backendCallbackUrl);
  console.log("카카오 인증 URL:", kakaoLoginUrl);
  
  // 카카오 인증 페이지로 이동
  window.location.href = kakaoLoginUrl;
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
