import LeftArrowIcon from "../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../assets/icons/RightArrowIcon.jsx";

function DateNavigation({ label, onPrev, onNext }) {
  return (
    <div className="flex flex-row w-full justify-center items-center px-4 mb-2">
      <div className="flex flex-row items-center gap-2">
        <LeftArrowIcon className="cursor-pointer" onClick={onPrev} />
        <p className="text-[18px]/[20px] font-[600] text-center">{label}</p>
        <RightArrowIcon className="cursor-pointer" onClick={onNext} />
      </div>
    </div>
  );
}

export default DateNavigation;
