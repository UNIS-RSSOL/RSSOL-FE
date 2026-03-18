import TimelineGrid, {
  GridLines,
  calcEventPosition,
} from "../calendar/TimelineGrid.jsx";

function MiniTimeline({ schedule, className = "" }) {
  const schedules = Array.isArray(schedule) ? schedule : [];

  return (
    <TimelineGrid accentColor="#004DFF" className={className}>
      {/* 이벤트 영역 */}
      <div
        className="relative"
        style={{ minHeight: `${Math.max(schedules.length, 1) * 50 + 4}px` }}
      >
        <GridLines accentColor="#004DFF" />
        {schedules.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[13px] text-[#87888c]">
              오늘 등록된 일정이 없습니다.
            </p>
          </div>
        )}
        {schedules.map((s, i) => {
          const pos = calcEventPosition(s.startDatetime, s.endDatetime);
          if (!pos) return null;
          return (
            <div
              key={s.id || i}
              className="absolute rounded-[8px] px-[8px] flex items-start pt-[6px]"
              style={{
                left: `${pos.left}%`,
                width: `${pos.width}%`,
                top: `${i * 50 + 4}px`,
                height: "46px",
                backgroundColor: i === 0 ? "#E7EAF3" : "#F0F0F0",
                border: "1px solid #E7EAF3",
              }}
            >
              <span className="text-[12px] font-[500] truncate">
                {s.username || s.storeName}
              </span>
            </div>
          );
        })}
      </div>
    </TimelineGrid>
  );
}

export default MiniTimeline;
