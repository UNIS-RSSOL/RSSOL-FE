import Button from "./Button";
import LeftArrowIcon from "../assets/newicons/LeftArrowIcon.jsx";

function BackButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="!h-[20px] !w-[20px] !p-0 !bg-transparent"
    >
      <LeftArrowIcon />
    </Button>
  );
}

export default BackButton;
