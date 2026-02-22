import Button from "../common/Button";

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
      className={`relative h-[123px] w-[360px] !justify-start pl-[35px] rounded-[11px] ${selected ? "!bg-[#CCDBFF] !border-[1.09px] !border-[#3370FF]" : "!bg-[#EDF0F7] border-[1.09px] border-transparent shadow-[0_4px_8px_0_rgba(0,0,0,0.2)]"}`}
    >
      {children}
    </Button>
  );
}

export default OnboardingBtn;
