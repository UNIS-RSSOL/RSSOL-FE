import React from "react";
import { useNavigate } from "react-router-dom";

import LoginGoogle from "../../assets/LoginGoogle.jsx";
import LoginKakao from "../../assets/LoginKakao.jsx";
import LoginNaver from "../../assets/LoginNaver.jsx";
import { LogoImage } from "../../assets/icons/logo2.jsx";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/onboarding");
  }

  return (
    <div className="w-full h-screen bg-[#F8FBFE] flex flex-col justify-center items-center">
      {/* 로고 */}
      <div className="mb-10 flex flex-col items-center text-center">
        <LogoImage className="w-[180px] h-auto mb-3" />
        <p className="text-[15px] font-medium text-[#000]">번거로운 알바 스케줄링, 원터치로 끝!</p>
      </div>

      {/* 로그인 버튼들 */}
      <div className="flex flex-col gap-4 w-[80%] max-w-[300px]">
        <LoginKakao onClick={handleLogin} />
        <LoginNaver onClick={handleLogin} />
        <LoginGoogle onClick={handleLogin} />
      </div>

      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-500 text-black rounded-lg"
      >
        로그인하기
      </button>
    </div>
  );
}

export default Login;
