function FooterMenu({ MenuIcon, title, onClick }) {
  return (
    <div
      className="flex-col justify-items-center items-center w-[90px] cursor-pointer"
      onClick={onClick}
    >
      {MenuIcon}
      <p className="font-medium text-[11px] mt-[3px]">{title}</p>
    </div>
  );
}

export default FooterMenu;
