import BackButton from "../../common/BackButton";

function TopBar({ title, onBack }) {
  return (
    <div className="fixed flex left-0 top-0 items-center z-50 w-full h-[60px] px-4 bg-white border-b border-[#e7eaf3]">
      <div className="w-full flex items-center">
        <BackButton onClick={onBack} />

        <p className="fixed left-1/2 -translate-x-1/2 text-[18px] font-semibold">
          {title}
        </p>
      </div>
    </div>
  );
}

export default TopBar;
