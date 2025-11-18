import TypeIcon from "../../assets/icons/TypeIcon.jsx";
import GreenBtn from "../../components/common/GreenBtn.jsx";
import InfoItem from "../../components/common/mypage/InfoItem.jsx";
import MapIcon from "../../assets/icons/MapIcon.jsx";
import PhoneIcon from "../../assets/icons/PhoneIcon.jsx";
import SaveIcon from "../../assets/icons/SaveIcon.jsx";

function Toast({ children }) {
  return (
    <div>
      <div className="fixed w-full min-[393px]:w-[393px] bottom-0 left-1/2 -translate-x-1/2 bg-[#fdfffe] flex shadow-[0px_-1px_20px_0px_rgba(0,0,0,0.25)] rounded-t-2xl flex-col p-5">
        {children}
      </div>
    </div>
  );
}

export default Toast;
