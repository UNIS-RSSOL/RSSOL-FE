import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { LogoImage } from "../../assets/icons/logo2.jsx";
import { getDevToken } from "../../services/authService.js";
import { goToKakaoLogin } from "../../services/kakaoLogin.js";
import GreenBtn from "../../components/common/GreenBtn.jsx";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

        // 성공 후 온보딩 페이지로 이동
        navigate("/onboarding");
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
    <div className="w-full h-screen bg-white flex flex-col justify-center items-center">
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-center">로그인 처리 중...</p>
          </div>
        </div>
      )}
      
      {/* 로고 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <LogoImage className="w-[180px] h-auto mb-3" />
        <p className="text-[15px] font-medium text-[#000]">
          번거로운 알바 스케줄링, 원터치로 끝!
        </p>
      </div>

      {/* 로그인 버튼들 */}
      <div className="flex flex-col gap-4 w-[80%] max-w-[300px] mb-[20px]">
        <GreenBtn
          className="h-[48px] text-[15px] font-semibold text-[#381e1f] bg-[#FEE500] hover:bg-[#FEE500]"
          onClick={goToKakaoLogin}
        >
          카카오 로그인
        </GreenBtn>
        <GreenBtn
          className="h-[48px] text-[15px] font-semibold text-white bg-[#03C75A] hover:bg-[#03C75A]"
          onClick={handleLogin}
        >
          네이버 로그인
        </GreenBtn>
        <GreenBtn
          className="h-[48px] text-[15px] font-semibold text-black bg-[#ffffff] hover:bg-[#ffffff]"
          onClick={handleLogin}
        >
          구글 로그인
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
