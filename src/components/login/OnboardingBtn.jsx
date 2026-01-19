import Button from "../Button";
import { useState, useEffect } from "react";

function OnboardingBtn({ onClick, children, role, value }) {
  const selected = role === value;

  const handleSelect = () => {
    if (!selected) {
      onClick(value);
    }
  };

  return (
    <Button
      onClick={handleSelect}
      className={`h-[112px] w-[330px] ${selected ? "!bg-[#68e194]/20 !border-[1px] !border-[#68e194]" : "bg-[#edf0f7] border-[1px] border-transparent shadow-[0_4px_8px_0_rgba(0,0,0,0.2)]"}`}
    >
      {children}
    </Button>
  );
}

export default OnboardingBtn;
