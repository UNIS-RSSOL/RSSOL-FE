import { useState } from "react";

function Box({ disabled, children, className = "", onClick }) {
  return (
    <div
      className={`flex w-full p-[15px] bg-white rounded-[15px] border border-[#e7eaf3] items-center bg-[#FDFFFE] ${disabled ? "cursor-default" : "cursor-pointer"} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Box;
