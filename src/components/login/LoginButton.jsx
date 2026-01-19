import Button from "../Button.jsx";

function LoginButton({ className = "", onClick, icon, color, children }) {
  return (
    <Button
      className={`h-[45px] w-[300px] !rounded-[5px] hover:!opacity-100 ${className}`}
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
