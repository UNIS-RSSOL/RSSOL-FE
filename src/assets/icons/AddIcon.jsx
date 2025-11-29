function AddIcon({ onClick, className }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="15"
        stroke="black"
        strokeWidth="2"
      />
      <path
        d="M16 7.3335C16.5316 7.33375 16.9628 7.81843 16.9629 8.4165V15.0376H23.583C24.1812 15.0377 24.666 15.4687 24.666 16.0005C24.6658 16.5321 24.1811 16.9633 23.583 16.9634H16.9629V23.5835C16.9628 24.1816 16.5316 24.6663 16 24.6665C15.4682 24.6665 15.0372 24.1817 15.0371 23.5835V16.9634H8.41602C7.81794 16.9633 7.33326 16.5321 7.33301 16.0005C7.33301 15.4687 7.81778 15.0377 8.41602 15.0376H15.0371V8.4165C15.0372 7.81827 15.4682 7.3335 16 7.3335Z"
        fill="black"
      />
    </svg>
  );
}

export default AddIcon;
