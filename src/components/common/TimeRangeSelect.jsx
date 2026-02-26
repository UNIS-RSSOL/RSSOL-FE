import TimeSelect from "./TimeSelect.jsx";

function TimeRangeSelect({ start, end, onStartChange, onEndChange }) {
  return (
    <div className="flex items-center gap-2">
      <TimeSelect value={start} onChange={onStartChange} />
      <span className="text-[14px] text-[#87888c]">-</span>
      <TimeSelect value={end} onChange={onEndChange} />
    </div>
  );
}

export default TimeRangeSelect;
