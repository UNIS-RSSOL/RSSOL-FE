function PencilIcon({ onClick, isFilled }) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
      onClick={onClick}
    >
      <rect width="25" height="25" />
      <path
        d="M16.0318 3.35533L4.20039 15.5999L2.40039 21.5999L8.40039 19.7999L20.645 7.96853C21.9189 6.69463 21.9189 4.62923 20.645 3.35533C19.3711 2.08143 17.3057 2.08143 16.0318 3.35533Z"
        fill={isFilled ? "#68E194" : "none"}
      />
      <path
        d="M12.0004 22.1999H21.6004M15.0004 4.7999L19.2004 8.3999M4.20039 15.5999L16.0318 3.35533C17.3057 2.08143 19.3711 2.08143 20.645 3.35533C21.9189 4.62923 21.9189 6.69463 20.645 7.96853L8.40039 19.7999L2.40039 21.5999L4.20039 15.5999Z"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default PencilIcon;
