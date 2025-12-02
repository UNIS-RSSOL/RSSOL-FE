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
        console.log("카카오 콜백 처리 시작 - code:", code);
        console.log(
          "백엔드 요청 URL:",
          `${api.defaults.baseURL}/api/auth/kakao/callback?code=${code}`,
        );

        // 백엔드로 code 전달 (GET 요청으로 쿼리 파라미터로 전달)
        const res = await api.get("/api/auth/kakao/callback", {
          params: { code },
        });

        console.log("백엔드 응답 성공:", res.status, res.data);
        const session = res.data;
        console.log("카카오 로그인 응답:", session);

        if (!session || !session.accessToken) {
          console.error("세션 데이터가 없습니다. 응답:", res.data);
          navigate("/login?error=no_session");
          return;
        }

        // 세션 정보 저장
        handleKakaoSession(session);

        // newUser 필드 확인 (백엔드에서 newUser 또는 isNewUser로 반환할 수 있음)
        const isNewUser = session.newUser !== undefined ? session.newUser : session.isNewUser;
        
        console.log("카카오 로그인 응답 데이터:", {
          userId: session.userId,
          newUser: session.newUser,
          isNewUser: session.isNewUser,
          username: session.username,
          provider: session.provider
        });

        // 신규 회원인 경우 온보딩으로 이동
        if (isNewUser) {
          console.log("신규 회원 -> 온보딩으로 이동");
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate("/onboarding");
          return;
        }

        // 기존 회원인 경우 정보 등록 상태 확인
        // 활성 매장 정보를 확인하여 정보 등록 여부 판단
        try {
          const activeStoreRes = await api.get("/api/mypage/active-store");
          const activeStore = activeStoreRes.data;
          
          console.log("활성 매장 정보:", activeStore);
          
          // 활성 매장이 있으면 정보 등록 완료 -> 홈페이지로 이동
          if (activeStore && activeStore.storeId) {
            // 사용자 역할 확인을 위해 프로필 정보 조회 시도
            // owner 프로필을 먼저 시도
            try {
              await api.get("/api/mypage/owner/profile");
              console.log("사장님 프로필 확인 성공 -> /owner로 이동");
              window.history.replaceState({}, document.title, window.location.pathname);
              navigate("/owner");
              return;
            } catch (ownerError) {
              // owner 프로필이 없으면 staff로 시도
              try {
                await api.get("/api/mypage/staff/profile");
                console.log("알바생 프로필 확인 성공 -> /employee로 이동");
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate("/employee");
                return;
              } catch (staffError) {
                // 둘 다 실패하면 정보 미등록으로 간주
                console.log("프로필 확인 실패 -> 온보딩으로 이동");
                window.history.replaceState({}, document.title, window.location.pathname);
                navigate("/onboarding");
                return;
              }
            }
          } else {
            // 활성 매장이 없으면 정보 미등록 -> 온보딩으로 이동
            console.log("활성 매장 없음 -> 온보딩으로 이동");
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate("/onboarding");
            return;
          }
        } catch (storeError) {
          // 활성 매장 조회 실패 (404 등) -> 정보 미등록으로 간주
          console.log("활성 매장 조회 실패 (정보 미등록) -> 온보딩으로 이동:", storeError.response?.status);
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate("/onboarding");
          return;
        }
      } catch (err) {
        // 에러 상세 정보 로깅
        console.error("카카오 로그인 처리 에러:", err);
        console.error("에러 상세:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
          config: {
            url: err.config?.url,
            baseURL: err.config?.baseURL,
            method: err.config?.method,
          },
        });
        
        // CORS 에러 체크
        if (err.message?.includes("CORS") || err.code === "ERR_NETWORK") {
          console.error("⚠️ CORS 또는 네트워크 에러 발생 - 로컬 프론트에서 배포 백엔드로 요청 시 발생할 수 있음");
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

