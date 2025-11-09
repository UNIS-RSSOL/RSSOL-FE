function SaveIcon({ className }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16.8 13L16.8 22.6M21.6 17.8L12 17.8"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="7"
        y1="7"
        x2="15"
        y2="7"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 21H9C8.44772 21 8 20.5523 8 20V14C8 13.4477 8.44772 13 9 13H14"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 2C19.6569 2 21 3.34315 21 5V15H19V5C19 4.44771 18.5523 4 18 4H4C3.44771 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H13V22H4L3.8457 21.9961C2.31166 21.9184 1.08163 20.6883 1.00391 19.1543L1 19V5C1 3.34315 2.34315 2 4 2H18Z"
        fill="black"
      />
    </svg>
  );
}

export default SaveIcon;
