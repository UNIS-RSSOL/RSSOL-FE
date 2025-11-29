import { Children } from "react";

function WhiteBtn({ children, onClick, className }) {
  return (
    <div
      className={`h-[30px] rounded-[10px] bg-white border-[1px] border-black flex justify-center items-center text-[14px] font-regular cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default WhiteBtn;
