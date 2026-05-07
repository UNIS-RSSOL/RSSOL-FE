import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getScheduleByPeriod } from "../../services/WorkShiftService";
import TimelineGrid, { GridLines, calcEventPosition } from "./TimelineGrid.jsx";

const EVENT_COLORS = ["#99bbff", "#3370FF", "#1a4fcc"];
const getEventColorIndex = (startHour) => {
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const totalHours = hours.length - 1;
  const segmentSize = Math.trunc(totalHours / EVENT_COLORS.length);
  const normalizedHour = startHour - hours[0];
  return Math.min(
    EVENT_COLORS.length - 1,
    Math.floor(normalizedHour / segmentSize),
  );
};

function DayCalendar({
  date,
  onEventClick,
  selectedEventProp,
  setSelectedEventProp,
  storeId,
  refreshKey,
  className = "",
  externalWorkers,
  externalEvents,
  hideLabels = false,
}) {
  const [workers, setWorkers] = useState(externalWorkers || []);
  const [events, setEvents] = useState(externalEvents || []);

  useEffect(() => {
    // 외부 데이터가 제공되면 API 호출 건너뜀
    if (externalWorkers && externalEvents) {
      setWorkers(externalWorkers);
      setEvents(externalEvents);
      return;
    }

    // storeId 로드 전이면 대기
    if (!storeId) return;

    (async () => {
      try {
        const schedules = await getScheduleByPeriod(
          date.format("YYYY-MM-DD"),
          date.format("YYYY-MM-DD"),
          storeId,
        );

        if (schedules && schedules.length > 0) {
          const uniqueWorkers = Array.from(
            new Map(
              schedules.map((s) => [
                `${s.userStoreId}-${s.userId}`,
                { userStoreId: s.userStoreId, username: s.username },
              ]),
            ).values(),
          );

          setWorkers(uniqueWorkers);
          setEvents(
            schedules.map((s) => ({
              id: s.id,
              userStoreId: s.userStoreId,
              username: s.username,
              start: s.startDatetime,
              end: s.endDatetime,
            })),
          );
        }
      } catch (error) {
        console.error("일간 스케줄 조회 실패:", error);
      }
    })();
  }, [date, storeId, refreshKey, externalWorkers, externalEvents]);

  const getEventsForWorker = (userStoreId) =>
    events.filter((e) => e.userStoreId === userStoreId);

  return (
    <TimelineGrid
      accentColor="#FF4D4D"
      leftWidth={hideLabels ? 0 : 60}
      leftColumn={hideLabels ? [] : workers.map((worker) => (
        <div
          key={worker.userStoreId}
          className="h-[56px] flex items-center text-[13px] font-[500] pr-2 pl-1 break-all leading-tight"
        >
          {worker.username}
        </div>
      ))}
      className={className}
    >
      {workers.map((worker) => (
        <div key={worker.userStoreId} className="h-[56px] relative">
          <GridLines accentColor="#FF4D4D" />
          {getEventsForWorker(worker.userStoreId).map((event) => {
            const pos = calcEventPosition(event.start, event.end);
            if (!pos) return null;
            const isSelected =
              selectedEventProp && selectedEventProp.id === event.id;
            const colorIndex = getEventColorIndex(dayjs(event.start).hour());
            const isDarkBlock = colorIndex === EVENT_COLORS.length - 1;
            const textColor = isDarkBlock ? "#FFFFFF" : "#000000";

            return (
              <div
                key={event.id}
                className={`absolute top-[6px] bottom-[6px] rounded-[8px] flex items-start pt-[6px] px-[6px] cursor-pointer ${
                  isSelected ? "ring-2 ring-black brightness-90" : ""
                }`}
                style={{
                  left: `${pos.left}%`,
                  width: `${pos.width}%`,
                  backgroundColor: EVENT_COLORS[colorIndex],
                  border: `1px solid ${EVENT_COLORS[colorIndex]}`,
                  color: textColor,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const clickedEvent = {
                    id: event.id,
                    userStoreId: event.userStoreId,
                    username: event.username,
                    start: event.start,
                    end: event.end,
                  };
                  setSelectedEventProp(clickedEvent);
                  onEventClick(clickedEvent);
                }}
              >
                <span className="text-[12px] font-[500] truncate">
                  {worker.username}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </TimelineGrid>
  );
}

export default DayCalendar;
