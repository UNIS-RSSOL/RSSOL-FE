import React from "react";

function BottomBar({
  leftText,
  rightText,
  onLeftClick,
  onRightClick,
  disabledLeft = false,
  disabledRight = false,
}) {
  const base =
    "w-full h-12 rounded-xl text-black font-semibold text-sm appearance-none outline-none border-none shadow-none";

  return (
    <div className="sticky bottom-0 w-full px-4 py-3 bg-white border-t border-[#e7eaf3] flex flex-col gap-3">

      {/* LEFT BUTTON */}
      <button
        onClick={onLeftClick}
        disabled={disabledLeft}
        className={`${base} ${disabledLeft ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        style={{
          WebkitAppearance: "none",
          backgroundColor: "#68E194",  // ← 브라우저 기본색 완전 오버라이드
        }}
      >
        {leftText}
      </button>

      {/* RIGHT BUTTON */}
      <button
        onClick={onRightClick}
        disabled={disabledRight}
        className={`${base} ${disabledRight ? "opacity-70 cursor-not-allowed" : "opacity-100"}`}
        style={{
          WebkitAppearance: "none",
          backgroundColor: "#68E194",  // ← 강제 적용
        }}
      >
        {rightText}
      </button>

    </div>
  );
}

export default BottomBar;
