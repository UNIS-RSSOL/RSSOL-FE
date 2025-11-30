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
        console.log("카카오 로그인 응답:", session);

        if (!session || !session.accessToken) {
          console.error("세션 데이터가 없습니다. 응답:", res.data);
          navigate("/login?error=no_session");
          return;
        }

        // 세션 정보 저장
        handleKakaoSession(session);

        // 사용자 정보 등록 상태 확인
        // 정보 등록이 완료된 사용자: activeStoreId가 있고 역할이 설정된 경우
        const role = session.role?.toUpperCase();
        const isRegistered = session.activeStoreId && session.role;
        console.log("사용자 등록 상태:", {
          isRegistered,
          activeStoreId: session.activeStoreId,
          role: session.role,
          roleUpper: role,
          isNewUser: session.isNewUser
        });
        
        if (isRegistered) {
          // 정보 등록이 완료된 사용자 -> 홈페이지로 이동
          // 역할이 STAFF 또는 employee인 경우 employee 홈으로, 그 외는 owner 홈으로
          const isEmployee = role === "STAFF" || role === "EMPLOYEE" || session.role === "employee";
          const homePath = isEmployee ? "/employee" : "/owner";
          console.log("홈페이지로 이동:", homePath);
          navigate(homePath);
        } else {
          // 정보 미등록 사용자 또는 신규가입 -> 온보딩으로 이동
          console.log("온보딩으로 이동");
          navigate("/onboarding");
        }

        // URL에서 code 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        // 에러 상세 정보 로깅
        console.error("카카오 로그인 처리 에러:", err);
        console.error("에러 타입:", err.constructor.name);
        console.error("에러 메시지:", err.message);
        console.error("에러 응답 상태:", err.response?.status);
        console.error("에러 응답 데이터:", err.response?.data);
        console.error("에러 요청 URL:", err.config?.url);
        console.error("에러 요청 데이터:", err.config?.data);
        
        // 500 에러인 경우 서버 문제임을 명시
        if (err.response?.status === 500) {
          console.error("서버 내부 오류 (500)가 발생했습니다. 백엔드 로그를 확인해주세요.");
        }
        
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

