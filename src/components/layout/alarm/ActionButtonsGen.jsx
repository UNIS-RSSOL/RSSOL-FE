import React, { useState } from "react";

function ActionButtonsGen({ label, onClick }) {
  const [selected, setSelected] = useState(false);

  const base =
    "px-4 py-[6px] rounded-[8px] text-[13px] font-medium appearance-none outline-none border-none";

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => {
          setSelected(true);
          onClick?.();
        }}
        className={`${base} bg-[#68E194] text-black ${
          selected ? "opacity-30" : "opacity-100"
        }`}
        style={{
          WebkitAppearance: "none",
          backgroundColor: selected ? "rgba(104,225,148,0.3)" : "#68E194",
        }}
      >
        {label}
      </button>
    </div>
  );
}

export default ActionButtonsGen;
