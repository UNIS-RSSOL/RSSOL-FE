import React from "react";
import { ChevronLeft } from "lucide-react";

function TopBar({ title, onBack }) {
  return (
    <div className="absolute top-0 left-0 z-50 flex items-center w-full h-[60px] px-4 bg-white shadow-0">
      <button
        onClick={onBack}
        className="z-10 p-0 w-fit h-fit bg-transparent flex items-center justify-center"
        style={{
          WebkitAppearance: "none",
          backgroundColor: "transparent",
          border: "none",
          outline: "none",
        }}
      >
        <ChevronLeft size={24} />
      </button>

      <p className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold">
        {title}
      </p>
    </div>
  );
}

export default TopBar;
