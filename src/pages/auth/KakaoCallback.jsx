import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { handleKakaoSession } from "../../services/kakaoLogin.js";
import api from "../../services/api.js";

function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // URL에서 code 읽기
      const code = new URL(window.location.href).searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("카카오 로그인 에러:", error);
        navigate("/login?error=kakao_login_failed");
        return;
      }

      if (!code) {
        console.error("인증 코드가 없습니다.");
        navigate("/login?error=no_code");
        return;
      }

      try {
        // 백엔드로 code 전달
        const res = await api.post("/api/auth/kakao/callback", { code });
        
        const session = res.data;

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

        // URL에서 code 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error("카카오 로그인 처리 에러:", err);
        navigate("/login?error=kakao_login_failed");
      }
    };

    handleCallback();
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

