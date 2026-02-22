import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { getScheduleByPeriod } from "../../services/WorkShiftService";
import TimelineGrid, { GridLines, calcEventPosition } from "./TimelineGrid.jsx";
import {
  MOCK_WORKERS,
  createMockDayEvents,
} from "../../mocks/mockData.js"; // TODO: API 연결 후 이 import 제거

function DayCalendar({
  date,
  onEventClick,
  selectedEventProp,
  setSelectedEventProp,
  storeId,
  refreshKey,
  className = "",
}) {
  const [workers, setWorkers] = useState(MOCK_WORKERS); // TODO: API 연결 후 [] 로 변경
  const [events, setEvents] = useState(() =>
    createMockDayEvents(dayjs().format("YYYY-MM-DD")), // TODO: API 연결 후 [] 로 변경
  );

  useEffect(() => {
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
        // else: 목업 데이터 유지 (API 연결 후 빈 상태 표시로 변경)
      } catch (error) {
        console.error("일간 스케줄 조회 실패:", error);
        // 목업 데이터 유지 (API 연결 후 에러 처리로 변경)
      }
    })();
  }, [date, storeId, refreshKey]);

  const getEventsForWorker = (userStoreId) =>
    events.filter((e) => e.userStoreId === userStoreId);

  return (
    <TimelineGrid
      accentColor="#FF4D4D"
      leftWidth={60}
      leftColumn={workers.map((worker) => (
        <div
          key={worker.userStoreId}
          className="h-[56px] flex items-center text-[13px] font-[500] truncate pr-2"
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

            return (
              <div
                key={event.id}
                className={`absolute top-[6px] bottom-[6px] rounded-[8px] flex items-start pt-[6px] px-[6px] cursor-pointer ${
                  isSelected ? "ring-2 ring-black brightness-90" : ""
                }`}
                style={{
                  left: `${pos.left}%`,
                  width: `${pos.width}%`,
                  backgroundColor: "#E7EAF3",
                  border: "1px solid #E7EAF3",
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
