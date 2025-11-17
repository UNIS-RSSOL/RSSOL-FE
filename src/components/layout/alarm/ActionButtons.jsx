import React, { useState } from "react";


function ActionButtons({ leftLabel, rightLabel }) {
    const [selected, setSelected] = useState(null);
    const base = "px-4 py-[6px] rounded-[8px] border text-[13px] font-medium";

    return (
        <div className="flex gap-2 mt-2">
            <button
                onClick={() => setSelected("left")}
                className={`${base} ${
                selected === "left"
                ? "bg-[#68E194] text-white border-[#68E194]"
                : "bg-white border-gray-300 text-gray-600"
                }`}
                >
                {leftLabel}
                </button>
                <button
                onClick={() => setSelected("right")}
                className={`${base} ${
                selected === "right"
                ? "bg-[#68E194] text-white border-[#68E194]"
                : "bg-white border-gray-300 text-gray-600"
                }`}
                >
                {rightLabel}
            </button>
        </div>
    );
}
export default ActionButtons;