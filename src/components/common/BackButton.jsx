import { useNavigate } from "react-router-dom";
import Button from "./Button";
import LeftArrowIcon from "../../assets/icons/LeftArrowIcon.jsx";

function BackButton({ onClick }) {
  const navigate = useNavigate();
  return (
    <Button
      onClick={onClick || (() => navigate(-1))}
      className="!h-[20px] !w-[20px] !p-0 !bg-transparent"
    >
      <LeftArrowIcon />
    </Button>
  );
}

export default BackButton;
