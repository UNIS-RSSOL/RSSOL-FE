function HeaderMenu({ MenuIcon, title, onClick }) {
  return (
    <div
      className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer hover:opacity-80 transition"
      onClick={onClick}
    >
      {MenuIcon}
    </div>
  );
}

export default HeaderMenu;
