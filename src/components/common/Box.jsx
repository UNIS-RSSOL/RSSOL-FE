import { useState } from "react";

function Box({ disabled, children, className = "", onClick }) {
  return (
    <div
      className={`flex w-[360px] p-[15px] bg-white rounded-[15px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.20)] items-center bg-[#FDFFFE] cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Box;
