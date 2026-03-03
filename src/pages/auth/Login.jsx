import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getActiveStore } from "../../services/MypageService.js";
import { goToKakaoLogin } from "../../services/kakaoLogin.js";
import Splash from "../common/Splash.jsx";
import KakaoIcon from "../../assets/icons/KakaoIcon.jsx";
import NaverIcon from "../../assets/icons/NaverIcon.jsx";
import GoogleIcon from "../../assets/icons/GoogleIcon.jsx";
import LoginButton from "../../components/login/LoginButton.jsx";
import logoWhite from "../../assets/images/logo-white.svg";
import { getDevToken } from "../../services/DevTokenService.js";

function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState();

  useEffect(() => {
    const checkAutoLogin = async () => {
      const savedToken = localStorage.getItem("accessToken");

      if (savedToken) {
        setIsLoading(true);
        try {
          const activeStore = await getActiveStore();

          if (activeStore && activeStore.storeId) {
            if (activeStore.position === "OWNER") navigate("/owner");
            else if (activeStore.position === "STAFF") navigate("/employee");
          } else {
            navigate("/onboarding");
          }
        } catch (err) {
          console.log("자동 로그인 실패:", err);
          localStorage.removeItem("accessToken");
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAutoLogin();
  }, [navigate]);

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
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#004DFF] to-[#001E66] flex flex-col items-center z-40">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Splash />
        </div>
      )}

      {/* 로고 */}
      <div className="flex-1 flex items-center justify-center">
        <img src={logoWhite} alt="알솔 로고" className="w-[200px] h-[200px]" />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="w-[80%] max-w-[300px] mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      {/* 로그인 버튼들 */}
      <div className="flex flex-col gap-[10px] w-full max-w-[393px] px-[40px] pb-[60px]">
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

      {/* 개발용 바이패스 */}

      <div className="flex gap-4 pb-[40px]">
        <button
          className=" text-white/60 text-[12px] underline"
          onClick={async () => {
            localStorage.setItem("accessToken", "dev-token");
            localStorage.setItem("refreshToken", "dev-refresh");
            navigate("/owner");
          }}
        >
          DEV 사장
        </button>
        <button
          className="text-white/60 text-[12px] underline"
          onClick={async () => {
            localStorage.setItem("accessToken", "dev-token");
            localStorage.setItem("refreshToken", "dev-refresh");
            navigate("/employee");
          }}
        >
          DEV 알바
        </button>
      </div>
    </div>
  );
}

export default Login;
