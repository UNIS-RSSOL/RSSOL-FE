function FooterMenu({ MenuIcon, onClick }) {
  return (
    <div
      className="flex flex-1 flex-col justify-center items-center h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="h-[28px] flex items-center justify-center leading-none">
        {MenuIcon}
      </div>
    </div>
  );
}

export default FooterMenu;
