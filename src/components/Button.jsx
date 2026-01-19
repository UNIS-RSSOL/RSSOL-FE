function Button({ className = "", onClick, children }) {
  return (
    <div
      className={`!relative !flex !items-center !justify-center w-[136px] h-[32px] rounded-[10px] bg-[#68E194] font-[400] text-[14px] cursor-pointer hover:!opacity-80 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default Button;
