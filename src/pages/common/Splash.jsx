import { useState } from "react";
import React from "react";
import logo from "../../assets/logo.png";

function Splash() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* 폭을 모바일 크기로 고정 */}
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-md">
        <img src={logo} alt="Logo" className="splash-logo" />
        <h1 className="splash-title">RSSOL</h1>
        <p className="splash-subtitle">
          message규격 확인 규격 확인 귝격 확아아ㅓㅇ아아ㅏㅏㅏㅏㅏㅏㅏ
          message규격 확인 규격 확인 귝격 확아아ㅓㅇ아아ㅏㅏㅏㅏㅏㅏㅏ
          message규격 확인 규격 확인 귝격 확아아ㅓㅇ아아ㅏㅏㅏㅏㅏㅏㅏ
        </p>
      </div>
    </div>
  );
}

export default Splash;
