function RoundTag({ children, className = "" }) {
  return (
    <div
      className={`flex items-center justify-center !rounded-full !bg-white !border-[1px] !border-[#32d1aa] !shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] !text-center text-[16px] font-[600] px-5 py-1 ${className}`}
    >
      {children}
    </div>
  );
}

export default RoundTag;
