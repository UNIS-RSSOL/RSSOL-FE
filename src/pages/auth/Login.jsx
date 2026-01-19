import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LogoImage } from "../../assets/icons/logo2.jsx";
import { getDevToken } from "../../services/new/DevTokenService.js";
import { getActiveStore } from "../../services/new/MypageService.js";
import { goToKakaoLogin } from "../../services/kakaoLogin.js";
import EmpBtn from "../../assets/images/EmpBtn.png";
import OwnerBtn from "../../assets/images/OwnerBtn.png";
import Splash from "../common/Splash.jsx";
import KakaoIcon from "../../assets/newicons/KakaoIcon.jsx";
import NaverIcon from "../../assets/newicons/NaverIcon.jsx";
import GoogleIcon from "../../assets/newicons/GoogleIcon.jsx";
import LoginButton from "../../components/login/LoginButton.jsx";

function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOwnerBtn, setIsOwnerBtn] = useState(true);

  // 🔥 추가: 페이지 진입 시 토큰 확인 로직
  useEffect(() => {
    const checkAutoLogin = async () => {
      const savedToken = localStorage.getItem("accessToken");

      if (savedToken) {
        console.log("✅ 앱에서 전달된 토큰 발견, 자동 로그인 시도");
        setIsLoading(true);
        try {
          // 토큰이 유효한지 확인하고 역할(OWNER/STAFF)을 가져오기 위해 API 호출
          const activeStore = await getActiveStore();

          if (activeStore && activeStore.storeId) {
            if (activeStore.position === "OWNER") navigate("/owner");
            else if (activeStore.position === "STAFF") navigate("/employee");
          } else {
            navigate("/onboarding");
          }
        } catch (err) {
          console.log("자동 로그인 실패 (토큰 만료 등):", err);
          localStorage.removeItem("accessToken"); // 유효하지 않으면 삭제
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAutoLogin();
  }, [navigate]);

  // URL 파라미터에서 에러 확인
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorCode = searchParams.get("code");

    if (errorParam === "kakao_login_failed") {
      if (errorCode === "KOE101") {
        setError(
          "카카오 로그인 설정 오류(KOE101)가 발생했습니다. 관리자에게 문의하세요.",
        );
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
      console.log(response);

      // 토큰을 localStorage에 저장
      localStorage.setItem("accessToken", response);
      console.log("토큰 발급 완료:", response);

      // 기존 회원인지 확인하여 온보딩 여부 결정
      // 활성 매장 정보를 확인하여 정보 등록 여부 판단

      try {
        const activeStore = await getActiveStore();
        console.log("활성 매장 정보:", activeStore);

        // position 기반 라우팅 (owner/staff 구분)
        if (activeStore.position === "OWNER") {
          console.log("owner → /owner");
          navigate("/owner");
        } else if (activeStore.position === "STAFF") {
          console.log("staff → /employee");
          navigate("/employee");
        } else {
          //  예외 처리
          console.log("등록되지 않은 역할 → 온보딩");
          navigate("/onboarding");
        }
      } catch (storeError) {
        console.log(
          "활성 매장 조회 실패 → 온보딩으로 이동:",
          storeError.response?.status,
        );
        navigate("/onboarding");
        return;
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
        <div
          onClick={() => setIsOwnerBtn(!isOwnerBtn)}
          className="w-[170px] h-[170px] bg-transparent mb-3 cursor-pointer rounded-full overflow-hidden bg-transparent border-none p-0 outline-none focus:outline-none"
        >
          <img
            src={isOwnerBtn ? OwnerBtn : EmpBtn}
            alt="character button"
            style={{ width: "170px", height: "170px", objectFit: "cover" }}
          />
        </div>
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
      <div className="flex flex-col gap-2 w-[80%] max-w-[300px] mb-[20px]">
        <LoginButton
          className="!bg-[#fee500]"
          onClick={goToKakaoLogin}
          icon={<KakaoIcon />}
        >
          카카오 로그인
        </LoginButton>
        <LoginButton
          className="!bg-[#03C75A]"
          icon={<NaverIcon />}
          color="text-white"
        >
          네이버 로그인
        </LoginButton>
        <LoginButton className="!bg-white" icon={<GoogleIcon />}>
          구글 로그인
        </LoginButton>
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
