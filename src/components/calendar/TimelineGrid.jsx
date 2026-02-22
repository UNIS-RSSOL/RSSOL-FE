import dayjs from "dayjs";
import { useEffect, useRef } from "react";

export const TIMELINE_START = 0;
export const TIMELINE_END = 24;
export const TIMELINE_HOURS = Array.from(
  { length: TIMELINE_END - TIMELINE_START },
  (_, i) => i + TIMELINE_START,
);

const MIN_COL_WIDTH = 45;

/** 이벤트의 left%, width% 계산. 타임라인 범위 밖이면 null 반환 */
export function calcEventPosition(startDatetime, endDatetime) {
  const startH =
    dayjs(startDatetime).hour() + dayjs(startDatetime).minute() / 60;
  const endH =
    (dayjs(endDatetime).hour() === 0 ? 24 : dayjs(endDatetime).hour()) +
    dayjs(endDatetime).minute() / 60;
  const clampedStart = Math.max(startH, TIMELINE_START);
  const clampedEnd = Math.min(endH, TIMELINE_END);
  if (clampedStart >= TIMELINE_END || clampedEnd <= TIMELINE_START) return null;
  return {
    left:
      ((clampedStart - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100,
    width:
      ((clampedEnd - clampedStart) / (TIMELINE_END - TIMELINE_START)) * 100,
  };
}

/** 세로 그리드 라인 — relative 컨테이너 안에서 사용 */
export function GridLines({ accentColor = "#FF4D4D" }) {
  return (
    <div className="absolute inset-0 flex">
      {TIMELINE_HOURS.map((h) => (
        <div
          key={h}
          className={`flex-1 border-r border-[#E7EAF3] ${h === 8 ? "border-l" : ""}`}
          style={
            h === 8 ? { borderLeftColor: `${accentColor}4D` } : undefined
          }
        />
      ))}
    </div>
  );
}

/**
 * 타임라인 그리드 레이아웃 (0-24시, 좌우 스크롤)
 *
 * @param {string}    accentColor  8시 열 강조 색상
 * @param {ReactNode} leftColumn   왼쪽 고정 이름 열 (스크롤 영역 바깥)
 * @param {number}    leftWidth    왼쪽 이름 열 너비 (px)
 * @param {number}    initialHour  초기 스크롤 위치 시간
 * @param {ReactNode} children     스크롤 영역 안 타임라인 컨텐츠
 * @param {string}    className    추가 클래스
 */
function TimelineGrid({
  accentColor = "#FF4D4D",
  leftColumn,
  leftWidth = 0,
  initialHour = 7,
  children,
  className = "",
}) {
  const scrollRef = useRef(null);
  const labelRef = useRef(null);
  const gridWidth = TIMELINE_HOURS.length * MIN_COL_WIDTH;

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const hourWidth = el.scrollWidth / TIMELINE_HOURS.length;
      el.scrollLeft = initialHour * hourWidth;
      if (labelRef.current) {
        labelRef.current.scrollLeft = el.scrollLeft;
      }
    }
  }, []);

  const handleScroll = () => {
    if (labelRef.current && scrollRef.current) {
      labelRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  };

  return (
    <div className={`flex flex-col overflow-hidden ${className}`}>
      {/* 시간 라벨 행 */}
      <div className="flex">
        {leftWidth > 0 && (
          <div style={{ width: `${leftWidth}px` }} className="shrink-0" />
        )}
        <div ref={labelRef} className="flex-1 overflow-hidden min-w-0">
          <div style={{ width: `${gridWidth}px` }} className="flex">
            {TIMELINE_HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[13px] font-[500]"
                style={{ color: h === 8 ? accentColor : "#D9D9D9" }}
              >
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 이름 열 + 스크롤 타임라인 */}
      <div className="flex flex-1 mt-1 min-h-0">
        {leftColumn && leftWidth > 0 && (
          <div
            style={{ width: `${leftWidth}px` }}
            className="shrink-0 flex flex-col"
          >
            {leftColumn}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto min-w-0"
          onScroll={handleScroll}
        >
          <div
            style={{ width: `${gridWidth}px` }}
            className="flex flex-col min-h-full"
          >
            {children}
            <div className="flex-1 relative">
              <GridLines accentColor={accentColor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimelineGrid;
