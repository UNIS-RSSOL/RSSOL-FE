import React, { useState } from "react";

function ActionButtons({ leftLabel, rightLabel, onLeftClick, onRightClick }) {
  const [selected, setSelected] = useState(null);

  const base =
    "px-4 py-[6px] rounded-[8px] text-[13px] font-medium appearance-none outline-none border-none";

  return (
    <div className="flex gap-2 mt-2 justify-end">
      {leftLabel && (
        <button
          onClick={() => {
            setSelected("left");
            onLeftClick?.();
          }}
          className={`${base} bg-[#68E194] text-black ${
            selected === "left" ? "opacity-30" : "opacity-100"
          }`}
          style={{
            WebkitAppearance: "none",
            backgroundColor:
              selected === "left" ? "rgba(104,225,148,0.3)" : "#68E194",
          }}
        >
          {leftLabel}
        </button>
      )}

      {rightLabel && (
        <button
          onClick={() => {
            setSelected("right");
            onRightClick?.();
          }}
          className={`${base} bg-[#68E194] text-black ${
            selected === "right" ? "opacity-30" : "opacity-100"
          }`}
          style={{
            WebkitAppearance: "none",
            backgroundColor:
              selected === "right" ? "rgba(104,225,148,0.3)" : "#68E194",
          }}
        >
          {rightLabel}
        </button>
      )}
    </div>
  );
}

export default ActionButtons;
