import Button from "../common/Button.jsx";

function LoginButton({ className = "", onClick, icon, color, children }) {
  return (
    <Button
      className={`relative h-[48px] !w-full !rounded-[8px] hover:!opacity-100 border border-[#E0E0E0] ${className}`}
      onClick={onClick}
    >
      <div className="absolute w-[40px] h-full flex items-center justify-center left-0">
        {icon}
      </div>

      <span
        className={`text-[14px] font-[500] text-center text-black ${color}`}
      >
        {children}
      </span>
    </Button>
  );
}

export default LoginButton;
