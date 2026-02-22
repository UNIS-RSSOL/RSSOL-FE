function PillToggle({ tabs, activeKey, onChange }) {
  return (
    <div className="inline-flex rounded-full border-[1px] border-[#B3B3B3] overflow-hidden shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
      {tabs.map((tab, idx) => (
        <div
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`min-w-[72px] py-[12px] text-[14px] font-[500] text-center cursor-pointer transition-colors ${
            idx < tabs.length - 1
              ? "border-r-[1px] border-[#B3B3B3]"
              : ""
          } ${
            activeKey === tab.key
              ? "bg-[#E6E6E6] text-black"
              : "bg-white text-[#87888c]"
          }`}
        >
          {tab.label}
        </div>
      ))}
    </div>
  );
}

export default PillToggle;
