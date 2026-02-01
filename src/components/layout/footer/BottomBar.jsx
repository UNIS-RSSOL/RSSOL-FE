import React from "react";
import Button from "../../Button.jsx";

function BottomBar({
  leftText,
  rightText,
  onLeftClick,
  onRightClick,
  disabledLeft = false,
  disabledRight = false,
  singleButton = false,
  singleButtonText,
  onSingleClick,
  disabledSingle = false,
}) {
  const base =
    "w-full h-12 rounded-xl text-black font-semibold text-sm appearance-none outline-none border-none shadow-none";

  if (singleButton) {
    return (
      <div className="sticky bottom-0 w-full px-4 py-3 bg-white border-t border-[#e7eaf3] flex flex-col gap-3">
        <Button
          onClick={onSingleClick}
          disabled={disabledSingle}
          className={`h-[48px] w-[361px] font-[600] text-[16px] ${base} ${disabledSingle ? "opacity-60 cursor-not-allowed" : "opacity-100"}`}
        >
          {singleButtonText || rightText || leftText}
        </Button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 w-full px-4 py-3 bg-white border-t border-[#e7eaf3] flex flex-col gap-3">
      {/* LEFT BUTTON */}
      <button
        onClick={onLeftClick}
        disabled={disabledLeft}
        className={`${base} ${disabledLeft ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        style={{
          WebkitAppearance: "none",
          backgroundColor: "#68E194", // ← 브라우저 기본색 완전 오버라이드
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
          backgroundColor: "#68E194", // ← 강제 적용
        }}
      >
        {rightText}
      </button>
    </div>
  );
}

export default BottomBar;
