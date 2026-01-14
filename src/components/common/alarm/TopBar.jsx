import React from "react";
import { ChevronLeft } from "lucide-react";

function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center z-50 w-full h-[60px] px-4 bg-white shadow-[0_4px_8px_0_rgba(0,0,0,0.08)]">
      <button
        onClick={onBack}
        className="bg-transparent flex items-center justify-center"
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
