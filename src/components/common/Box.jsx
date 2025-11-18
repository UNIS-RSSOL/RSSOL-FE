import { useState } from "react";

function Box({ disabled, children, className }) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <div
      className={`flex flex-col w-[360px] p-[18px] rounded-[20px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.20)] items-center  ${isSelected ? "bg-[#68E194]/[0.2] border-[1px] border-[#68E194]" : "bg-[#FDFFFE]"} ${disabled ? "cursor-default" : "cursor-pointer"} ${className}`}
      onClick={disabled ? () => {} : () => setIsSelected(!isSelected)}
    >
      {children}
    </div>
  );
}

export default Box;
