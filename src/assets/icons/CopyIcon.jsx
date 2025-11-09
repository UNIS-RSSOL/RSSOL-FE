function CopyIcon({ onClick }) {
  return (
    <svg
      width="15"
      height="17"
      viewBox="0 0 15 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
      onClick={onClick}
    >
      <path
        d="M13.333 9.27109L13.333 3.33352C13.333 1.9528 12.2137 0.833509 10.833 0.833525L4.89551 0.833593M8.33301 15.8336L2.70801 15.8336C1.67248 15.8336 0.83301 14.9941 0.83301 13.9586L0.833009 5.83359C0.833009 4.79806 1.67247 3.95859 2.70801 3.95859L8.33301 3.95859C9.36854 3.95859 10.208 4.79806 10.208 5.83359L10.208 13.9586C10.208 14.9941 9.36854 15.8336 8.33301 15.8336Z"
        stroke="black"
        strokeWidth="1.66667"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default CopyIcon;
