function GreenBtn({ children, className, onClick }) {
  return (
    <div
      className={`h-[30px] rounded-[10px] bg-[#68e194] flex justify-center items-center text-[14px] font-regular cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default GreenBtn;
