import HamburgerIcon from "../../assets/icons/HamburgerIcon.jsx";

function HomeHeader({ storeName, onMenuClick, rightIcon, onRightClick }) {
  return (
    <header className="flex items-center px-[16px] h-[52px] shrink-0 gap-[12px]">
      <div className="cursor-pointer p-[4px]" onClick={onMenuClick}>
        <HamburgerIcon />
      </div>
      <p className="text-[16px] font-[600] leading-[20px] flex-1 text-left">
        {storeName || "현재 매장 이름"}
      </p>
      <div className="cursor-pointer p-[4px]" onClick={onRightClick}>
        {rightIcon}
      </div>
    </header>
  );
}

export default HomeHeader;
