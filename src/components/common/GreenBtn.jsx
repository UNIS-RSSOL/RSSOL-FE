function GreenBtn({ children, className }) {
  return (
    <div
      className={`h-[30px] rounded-[10px] bg-[#68e194] flex justify-center items-center text-[16px] font-[600] cursor-pointer py-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default GreenBtn;
