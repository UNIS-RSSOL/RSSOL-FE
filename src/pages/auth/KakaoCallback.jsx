import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleKakaoSession } from "../../services/kakaoLogin.js";

function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // 백엔드가 카카오 콜백을 처리한 후 프론트엔드로 리다이렉트할 때
    // 세션 정보를 전달하는 방식:
    // 1. 쿼리 파라미터로 JSON 전달: ?session={encodeURIComponent(JSON.stringify(sessionData))}
    // 2. 개별 토큰 전달: ?accessToken=xxx&refreshToken=yyy&userId=123&isNewUser=false&...
    
    const error = searchParams.get("error");
    const sessionData = searchParams.get("session");
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (error) {
      console.error("카카오 로그인 에러:", error);
      navigate("/login?error=kakao_login_failed");
      return;
    }

    let session = null;

    try {
      // 방식 1: JSON으로 전달된 경우
      if (sessionData) {
        session = JSON.parse(decodeURIComponent(sessionData));
      }
      // 방식 2: 개별 파라미터로 전달된 경우
      else if (accessToken) {
        session = {
          accessToken,
          refreshToken: refreshToken || null,
          userId: parseInt(searchParams.get("userId")) || null,
          isNewUser: searchParams.get("isNewUser") === "true",
          username: searchParams.get("username") || null,
          email: searchParams.get("email") || null,
          profileImageUrl: searchParams.get("profileImageUrl") || null,
          provider: "kakao",
          providerId: searchParams.get("providerId") || null,
          activeStoreId: searchParams.get("activeStoreId") ? parseInt(searchParams.get("activeStoreId")) : null,
          role: searchParams.get("role") || null,
        };
      }

      if (!session || !session.accessToken) {
        console.error("세션 데이터가 없습니다.");
        navigate("/login?error=no_session");
        return;
      }

      // 세션 정보 저장
      handleKakaoSession(session);

      // 응답에서 isNewUser 확인
      if (session.isNewUser) {
        // 신규 유저는 온보딩 페이지로 이동
        navigate("/onboarding");
      } else {
        // 기존 유저는 역할에 따라 적절한 페이지로 이동
        if (session.activeStoreId) {
          // 역할에 따라 owner 또는 employee 홈으로 이동
          navigate(session.role === "employee" ? "/employee" : "/owner");
        } else {
          // activeStoreId가 없으면 온보딩으로 이동 (역할 설정 필요)
          navigate("/onboarding");
        }
      }

      // URL에서 세션 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error("세션 처리 에러:", err);
      navigate("/login?error=session_parse_error");
    }
  }, [searchParams, navigate]);

  return (
    <div className="w-full h-screen bg-white flex flex-col justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <p className="text-center">로그인 처리 중...</p>
      </div>
    </div>
  );
}

export default KakaoCallback;

