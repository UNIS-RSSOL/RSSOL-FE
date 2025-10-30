function FooterMenu({ MenuIcon, title }) {
  return (
    <div className="flex-col justify-items-center items-center w-[60px]">
      {MenuIcon}
      <p className="font-medium text-[10px] mt-[3px]">{title}</p>
    </div>
  );
}

export default FooterMenu;
