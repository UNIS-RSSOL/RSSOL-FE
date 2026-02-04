function Button({ className = "", onClick, children, disabled = false }) {
  return (
    <div
      className={`!flex !items-center !justify-center w-[136px] h-[32px] rounded-[10px] bg-[#68E194] font-[400] text-[14px]  hover:!opacity-80 ${className} ${disabled ? "!bg-[#e7eaf3] !cursor-not-allowed" : " bg-[#68E194] cursor-pointer"}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Button;
