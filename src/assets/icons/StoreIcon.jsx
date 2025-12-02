function StoreIcon({ className, filled = true }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="1"
        stroke="#26272A"
        strokeWidth="2"
      />
      <rect
        x="1"
        y="1"
        width="18"
        height="18"
        rx="1"
        fill={filled ? "#FDFFFE" : ""}
        stroke="#26272A"
        strokeWidth="2"
      />
      <path
        d="M8 10H13C13.5523 10 14 10.4477 14 11V19H7V11C7 10.4477 7.44772 10 8 10Z"
        fill={filled ? "#68E194" : ""}
        stroke="#26272A"
        strokeWidth="2"
      />
      <line
        x1="6"
        y1="5"
        x2="14"
        y2="5"
        stroke="#26272A"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default StoreIcon;
