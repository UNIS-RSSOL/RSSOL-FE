import dayjs from "dayjs";

const TIMELINE_START = 8;
const TIMELINE_END = 16;
const TIMELINE_HOURS = Array.from({ length: 8 }, (_, i) => i + TIMELINE_START);

function MiniTimeline({ schedules }) {
  return (
    <div>
      <div className="flex">
        {TIMELINE_HOURS.map((h, i) => (
          <div
            key={h}
            className={`flex-1 text-center text-[13px] font-[500] ${
              i === 0 ? "text-[#004DFF]" : "text-[#D9D9D9]"
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      <div className="relative mt-[4px] h-[160px]">
        <div className="absolute inset-0 flex">
          {TIMELINE_HOURS.map((h, i) => (
            <div
              key={h}
              className={`flex-1 ${i === 0 ? "border-l border-[#004DFF]/30" : ""} border-r border-[#E7EAF3]`}
            />
          ))}
        </div>

        {schedules.map((s, i) => {
          const startH = dayjs(s.startDatetime).hour();
          const startM = dayjs(s.startDatetime).minute();
          const endH = dayjs(s.endDatetime).hour();
          const endM = dayjs(s.endDatetime).minute();
          const startDecimal = startH + startM / 60;
          const endDecimal = (endH === 0 ? 24 : endH) + endM / 60;
          const clampedStart = Math.max(startDecimal, TIMELINE_START);
          const clampedEnd = Math.min(endDecimal, TIMELINE_END);
          if (clampedStart >= TIMELINE_END || clampedEnd <= TIMELINE_START)
            return null;
          const left =
            ((clampedStart - TIMELINE_START) /
              (TIMELINE_END - TIMELINE_START)) *
            100;
          const width =
            ((clampedEnd - clampedStart) / (TIMELINE_END - TIMELINE_START)) *
            100;
          return (
            <div
              key={s.id || i}
              className="absolute rounded-[8px] px-[8px] flex items-start pt-[6px]"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${i * 50 + 4}px`,
                height: "46px",
                backgroundColor: i === 0 ? "#E7EAF3" : "#F0F0F0",
                border: "1px solid #E7EAF3",
              }}
            >
              <span className="text-[12px] font-[500] truncate">
                {s.storeName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MiniTimeline;
