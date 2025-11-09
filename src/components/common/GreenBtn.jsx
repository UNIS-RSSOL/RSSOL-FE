function GreenBtn({ children, className }) {
  return (
    <div
      className={`h-[30px] rounded-[10px] bg-[#68e194] flex justify-center items-center text-[14px] font-regular cursor-pointer mt-3 ${className}`}
    >
      {children}
    </div>
  );
}

export default GreenBtn;
