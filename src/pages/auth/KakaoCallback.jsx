import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { completeKakaoLogin } from "../../services/kakaoLogin.js";

function KakaoCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      // code가 없으면 로그인 페이지로 이동
      navigate("/login");
      return;
    }

    const handleCallback = async () => {
      try {
        const session = await completeKakaoLogin(code);

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
      } catch (err) {
        console.error("Kakao login error:", err);
        // 에러 발생 시 로그인 페이지로 이동
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

