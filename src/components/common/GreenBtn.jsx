function GreenBtn({ children, className, onClick, disabled }) {
  return (
    <div
      className={`h-[30px] rounded-[10px]  flex justify-center items-center text-[14px] font-regular bg-[#68e194] ${disabled ? "opacity-50 cursor-not-allowed" : " cursor-pointer"} ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  );
}

export default GreenBtn;
