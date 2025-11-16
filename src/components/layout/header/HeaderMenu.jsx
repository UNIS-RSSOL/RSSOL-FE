function HeaderMenu({ MenuIcon, title, onClick }) {
  return (
    <button
      className="flex items-center justify-center w-[40px] h-[40px] cursor-pointer hover:opacity-80 transition"
      onClick={onClick}
    >
      {MenuIcon}
    </button>
  );
}

export default HeaderMenu;
