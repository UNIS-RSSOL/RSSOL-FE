import React from "react";
import { ChevronLeft } from "lucide-react";

function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center w-full h-[56px] px-4 bg-white shadow-sm">
      <button onClick={onBack} className="mr-3">
        <ChevronLeft size={24} />
      </button>
      <p className="text-[18px] font-semibold">{title}</p>
    </div>
  );
}

export default TopBar;
