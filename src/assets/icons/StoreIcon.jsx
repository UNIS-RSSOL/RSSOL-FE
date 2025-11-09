function StoreIcon({ className }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line
        x1="6"
        y1="5"
        x2="14"
        y2="5"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 1H17C18.1046 1 19 1.89543 19 3V17C19 18.1046 18.1046 19 17 19H3C1.89543 19 1 18.1046 1 17V3C1 1.89543 1.89543 1 3 1Z"
        stroke="black"
        strokeWidth="2"
      />
      <path
        d="M8 11H11C12.1046 11 13 11.8954 13 13V19H7V12C7 11.4477 7.44772 11 8 11Z"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
}

export default StoreIcon;
