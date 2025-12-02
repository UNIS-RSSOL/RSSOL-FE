import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { LogoImage } from "../../assets/icons/logo2.jsx";
import { getDevToken } from "../../services/authService.js";
import { goToKakaoLogin } from "../../services/kakaoLogin.js";
import GreenBtn from "../../components/common/GreenBtn.jsx";
import api from "../../services/api.js";
import EmpBtn from "../../assets/images/EmpBtn.png";
import OwnerBtn from "../../assets/images/OwnerBtn.png";

function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOwnerBtn, setIsOwnerBtn] = useState(true);
  
  // URL 파라미터에서 에러 확인
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorCode = searchParams.get("code");
    
    if (errorParam === "kakao_login_failed") {
      if (errorCode === "KOE101") {
        setError("카카오 로그인 설정 오류(KOE101)가 발생했습니다. 관리자에게 문의하세요.");
      } else {
        setError("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
      }
      // 에러 파라미터 제거
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleLogin = () => {
    navigate("/onboarding");
  };

  const handleDevLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getDevToken(email);

      if (response.success) {
        // 토큰을 localStorage에 저장
        localStorage.setItem("accessToken", response.data);
        console.log("토큰 발급 완료:", response.data);

        // 기존 회원인지 확인하여 온보딩 여부 결정
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
              navigate("/owner");
              return;
            } catch (ownerError) {
              // owner 프로필이 없으면 staff로 시도
              try {
                await api.get("/api/mypage/staff/profile");
                console.log("알바생 프로필 확인 성공 -> /employee로 이동");
                navigate("/employee");
                return;
              } catch (staffError) {
                // 둘 다 실패하면 정보 미등록으로 간주
                console.log("프로필 확인 실패 -> 온보딩으로 이동");
                navigate("/onboarding");
                return;
              }
            }
          } else {
            // 활성 매장이 없으면 정보 미등록 -> 온보딩으로 이동
            console.log("활성 매장 없음 -> 온보딩으로 이동");
            navigate("/onboarding");
            return;
          }
        } catch (storeError) {
          // 활성 매장 조회 실패 (404 등) -> 정보 미등록으로 간주
          console.log("활성 매장 조회 실패 (정보 미등록) -> 온보딩으로 이동:", storeError.response?.status);
          navigate("/onboarding");
          return;
        }
      } else {
        setError(response.message || "토큰 발급에 실패했습니다.");
      }
    } catch (err) {
      setError(err.message || "로그인 중 오류가 발생했습니다.");
      console.error("Dev login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-linear-to-r from-[#5EDEAB] to-[#68E194] flex flex-col justify-center items-center">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Splash />
        </div>
      )}
      
      {/* 로고 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <button
          onClick={() => setIsOwnerBtn(!isOwnerBtn)}
          className="mb-3 cursor-pointer rounded-full overflow-hidden bg-transparent border-none p-0 outline-none focus:outline-none"
          style={{ 
            width: "170px", 
            height: "170px",
            background: "transparent",
            border: "none",
            padding: 0,
            outline: "none",
            boxShadow: "none"
          }}
        >
          <img
            src={isOwnerBtn ? OwnerBtn : EmpBtn}
            alt="character button"
            style={{ width: "170px", height: "170px", objectFit: "cover" }}
          />
        </button>
        <LogoImage className="w-[180px] h-auto mb-3" />
        <p className="text-[15px] font-medium text-[#000]">
          번거로운 알바 스케줄링, 원터치로 끝!
        </p>
      </div>

      {/* 에러 메시지 표시 */}
      {error && (
        <div className="w-[80%] max-w-[300px] mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {/* 로그인 버튼들 */}
      <div className="flex flex-col gap-4 w-[80%] max-w-[300px] mb-[20px]">
        <GreenBtn
          className="h-[48px] text-[15px] font-semibold text-[#381e1f] bg-[#FEE500] hover:bg-[#FEE500]"
          onClick={goToKakaoLogin}
        >
          카카오 로그인
        </GreenBtn>
      </div>

      {/* 체크용 로그인 (개발용) */}
      <div className="w-[80%] max-w-[300px] mt-4 pt-4 border-t border-gray-200">
        <form onSubmit={handleDevLogin} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="이메일을 입력하세요"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? "처리 중..." : "체크용 로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
