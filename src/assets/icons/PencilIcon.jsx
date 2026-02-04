function PencilIcon({ className = "", filled = false, onClick }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
    >
      <path
        d="M14.6314 1.95543L2.8 14.2L1 20.2L7 18.4L19.2446 6.56863C20.5185 5.29473 20.5185 3.22932 19.2446 1.95542C17.9707 0.681523 15.9053 0.681526 14.6314 1.95543Z"
        fill={filled ? "#68E194" : "none"}
      />
      <path
        d="M10.6 20.8H20.2M13.6 3.4L17.8 7M2.8 14.2L14.6314 1.95543C15.9053 0.681526 17.9707 0.681523 19.2446 1.95542C20.5185 3.22932 20.5185 5.29473 19.2446 6.56863L7 18.4L1 20.2L2.8 14.2Z"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PencilIcon;
