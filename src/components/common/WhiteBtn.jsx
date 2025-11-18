import { Children } from "react";

function WhiteBtn({ children, onClick }) {
  return (
    <div
      className="h-[30px] rounded-[10px] bg-white border-[1px] border-black flex justify-center items-center text-[14px] font-regular cursor-pointer "
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default WhiteBtn;
