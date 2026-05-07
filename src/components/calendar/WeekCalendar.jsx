import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "dayjs/locale/ko";
import { getScheduleByPeriod } from "../../services/WorkShiftService";
const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

const getDayColor = (idx) => {
  if (idx === 0) return "text-[#FF8A8A]";
  if (idx === 6) return "text-[#7BA3FF]";
  return "text-[#999999]";
};

function WeekCalendar({
  date,
  onEventClick,
  selectedEventProp,
  setSelectedEventProp,
  storeId,
  refreshKey,
  className = "",
  externalWorkers,
  externalEvents,
}) {
  const [week, setWeek] = useState([]);
  const [workers, setWorkers] = useState(externalWorkers || []);
  const [events, setEvents] = useState(externalEvents || []);

  useEffect(() => {
    const startOfWeek = dayjs(date).locale("ko").startOf("week");
    setWeek(
      Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")),
    );

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
          startOfWeek.format("YYYY-MM-DD"),
          startOfWeek.add(6, "day").format("YYYY-MM-DD"),
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
        console.error("Error fetching schedules:", error);
      }
    })();
  }, [date, storeId, refreshKey, externalWorkers, externalEvents]);

  const getEventForCell = (userStoreId, day) =>
    events.find(
      (e) =>
        e.userStoreId === userStoreId &&
        dayjs(e.start).format("YYYY-MM-DD") === day,
    );

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {/* Day name headers */}
      <div className="flex border-b border-[#E7EAF3]">
        <div className="w-[60px] shrink-0 border-r border-[#E7EAF3]" />
        {DAYS.map((day, idx) => (
          <div
            key={day}
            className={`flex-1 text-center text-[13px] font-[600] py-2 ${getDayColor(idx)}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Worker rows */}
      {workers.map((worker) => (
        <div
          key={worker.userStoreId}
          className="flex h-[70px]"
        >
          <div className="w-[60px] shrink-0 flex items-center justify-center text-center text-[13px] font-[500] px-1 border-r border-[#E7EAF3] break-all leading-tight">
            {worker.username}
          </div>
          {week.map((w) => {
            const event = getEventForCell(
              worker.userStoreId,
              w.format("YYYY-MM-DD"),
            );
            const isSelected =
              selectedEventProp &&
              selectedEventProp.id === event?.id &&
              selectedEventProp.userStoreId === worker.userStoreId;

            return (
              <div
                key={w.format("DD")}
                className="flex-1 flex items-center justify-center p-[3px]"
              >
                {event ? (
                  <div
                    className={`w-full h-full rounded-[10px] flex items-center justify-center cursor-pointer ${
                      isSelected ? "ring-2 ring-black brightness-90" : ""
                    }`}
                    style={(() => {
                      const colorIndex = getEventColorIndex(
                        dayjs(event.start).hour(),
                      );
                      const isDarkBlock = colorIndex === EVENT_COLORS.length - 1;
                      return {
                        backgroundColor: EVENT_COLORS[colorIndex],
                        color: isDarkBlock ? "#FFFFFF" : "#000000",
                      };
                    })()}
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
                    <span className="text-[11px] font-[500]">
                      {dayjs(event.start).format("H")}-
                      {dayjs(event.end).format("H")}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}

      {/* Empty fill */}
      <div className="flex flex-1">
        <div className="w-[60px] shrink-0 border-r border-[#E7EAF3]" />
        <div className="flex-1" />
      </div>
    </div>
  );
}

export default WeekCalendar;
