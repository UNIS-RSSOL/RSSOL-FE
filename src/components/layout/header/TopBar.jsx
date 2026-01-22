import BackButton from "../../BackButton";

function TopBar({ title }) {
  return (
    <div className="flex items-center z-50 w-full h-[60px] px-4 bg-white shadow-[0_4px_8px_0_rgba(0,0,0,0.08)]">
      <BackButton />

      <p className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold">
        {title}
      </p>
    </div>
  );
}

export default TopBar;
