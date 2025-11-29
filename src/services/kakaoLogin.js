/**
 * 카카오 로그인 서비스
 * 
 * 플로우:
 * 1. 사용자가 카카오 로그인 버튼 클릭
 * 2. 카카오 인증 페이지로 이동 (redirect_uri는 백엔드 콜백 URL)
 * 3. 카카오가 백엔드 콜백 URL로 code를 전달
 * 4. 백엔드가 code를 받아서 카카오 토큰 교환 및 사용자 정보 처리
 * 5. 백엔드가 프론트엔드 콜백 URL로 리다이렉트 (세션 정보 포함)
 * 6. 프론트엔드가 세션 정보를 받아서 저장하고 적절한 페이지로 이동
 * 
 * 백엔드 개발자를 위한 정보:
 * - 카카오가 리다이렉트할 URL (redirect_uri):
 *   - 로컬: http://localhost:8080/api/auth/kakao/callback
 *   - 프로덕션: https://connecti.store/api/auth/kakao/callback
 * 
 * - 백엔드가 프론트엔드로 리다이렉트할 URL:
 *   - 로컬: http://localhost:5173/auth/kakao/callback
 *   - 프로덕션: https://connecti.store/auth/kakao/callback
 * 
 * - 세션 정보 전달 방법 (둘 중 하나 선택):
 *   1. JSON으로 전달: ?session={encodeURIComponent(JSON.stringify({accessToken, refreshToken, userId, isNewUser, ...}))}
 *   2. 개별 파라미터: ?accessToken=xxx&refreshToken=yyy&userId=123&isNewUser=false&...
 * 
 * - 에러 발생 시: ?error=error_message
 */

import api from "./api";

const KAKAO_AUTH_BASE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_CLIENT_ID = "3ddfc329270e2ce7e4ab45f3fcca3891";

// 백엔드 콜백 URL (카카오가 리다이렉트할 주소)
const BACKEND_LOCAL_CALLBACK = "http://localhost:8080/api/auth/kakao/callback";
const BACKEND_PROD_CALLBACK = "https://connecti.store/api/auth/kakao/callback";

// 프론트엔드 콜백 URL (백엔드가 처리 후 리다이렉트할 주소)
const FRONTEND_LOCAL_CALLBACK = "http://localhost:5173/auth/kakao/callback";
const FRONTEND_PROD_CALLBACK = "https://connecti.store/auth/kakao/callback";

const TOKEN_REFRESH_PATH = "/api/auth/token/refresh";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * 백엔드 콜백 URL을 반환합니다 (카카오 OAuth redirect_uri)
 */
const getBackendCallbackUri = () => {
  // 프로덕션 환경 체크: Vite의 PROD 모드 또는 connecti.store 도메인 사용 시
  const isProduction = 
    import.meta.env.PROD || 
    window.location.hostname === 'connecti.store' ||
    window.location.hostname.includes('connecti.store');
  
  return isProduction ? BACKEND_PROD_CALLBACK : BACKEND_LOCAL_CALLBACK;
};

/**
 * 프론트엔드 콜백 URL을 반환합니다 (백엔드가 리다이렉트할 주소)
 * 
 * 백엔드에서 카카오 콜백을 처리한 후 이 URL로 리다이렉트해야 합니다.
 * 예시: 
 * - 성공 시: {getFrontendCallbackUri()}?session={encodeURIComponent(JSON.stringify(sessionData))}
 * - 실패 시: {getFrontendCallbackUri()}?error=error_message
 * 
 * @returns {string} 프론트엔드 콜백 URL
 */
export const getFrontendCallbackUri = () => {
  const isProduction = 
    import.meta.env.PROD || 
    window.location.hostname === 'connecti.store' ||
    window.location.hostname.includes('connecti.store');
  
  return isProduction ? FRONTEND_PROD_CALLBACK : FRONTEND_LOCAL_CALLBACK;
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
 * redirect_uri는 백엔드 콜백 URL을 사용합니다.
 * @returns {string}
 */
export const getKakaoAuthorizeUrl = () => {
  const redirectUri = encodeURIComponent(getBackendCallbackUri());
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
 * 백엔드가 카카오 콜백을 처리한 후 프론트엔드로 리다이렉트할 때 사용됩니다.
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
