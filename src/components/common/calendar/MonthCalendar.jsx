import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useEffect, useMemo, useState } from "react";
import { fetchSchedules } from "../../../services/CalendarService.js";

function MonthCalendar({ date }) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];
  const [calendarDays, setCalendarDays] = useState([]);
  const [eventsByDay, setEventsByDay] = useState({});
  const [workers, setWorkers] = useState([]);

  const baseDate = useMemo(() => dayjs(date ?? dayjs()), [date]);

  useEffect(() => {
    const localizedDate = baseDate.locale("ko");
    const startDate = localizedDate.startOf("month").startOf("week");
    const endDate = localizedDate.endOf("month").endOf("week");
    const totalDays = endDate.diff(startDate, "day") + 1;
    const daysArray = Array.from({ length: totalDays }, (_, idx) =>
      startDate.add(idx, "day"),
    );
    setCalendarDays(daysArray);

    (async () => {
      try {
        const schedules = await fetchSchedules(
          startDate.format("YYYY-MM-DD"),
          endDate.format("YYYY-MM-DD"),
        );
        if (!schedules) {
          setWorkers([]);
          setEventsByDay({});
          return;
        }

        const uniqueWorkers = [
          ...new Set(schedules.map((schedule) => schedule.userStoreId)),
        ];
        setWorkers(uniqueWorkers);

        const grouped = schedules.reduce((acc, schedule) => {
          const dayKey = dayjs(schedule.startDatetime).format("YYYY-MM-DD");
          if (!acc[dayKey]) acc[dayKey] = [];
          acc[dayKey].push({
            worker: schedule.userStoreId,
            start: schedule.startDatetime,
            end: schedule.endDatetime,
          });
          return acc;
        }, {});

        setEventsByDay(grouped);
      } catch (error) {
        console.error("Error fetching monthly schedules:", error);
      }
    })();
  }, [baseDate]);

  const getWorkerColor = (workerId) => {
    const workerIndex = workers.indexOf(workerId);
    if (workerIndex === -1) return colors[0];
    return colors[workerIndex % colors.length];
  };

  const todayKey = dayjs().format("YYYY-MM-DD");
  const currentMonth = baseDate.month();

  return (
    <div className="flex flex-col w-full max-w-[362px] h-[596px] border-[0.5px] border-black rounded-[20px] bg-white overflow-hidden">
      <div className="grid grid-cols-7 w-full text-center text-[12px] font-[500] border-b border-[#e7eaf3]">
        {days.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 flex-1 w-full">
        {calendarDays.map((day) => {
          const key = day.format("YYYY-MM-DD");
          const isCurrentMonth = day.month() === currentMonth;
          const isToday = key === todayKey;
          const dayEvents = eventsByDay[key] || [];
          const visibleEvents = dayEvents.slice(0, 3);

          const cellClasses = [
            "flex flex-col border border-[#e7eaf3] px-[6px] py-[4px] min-h-[82px]",
            !isCurrentMonth ? "bg-[#f9fafc] text-[#bfc3cf]" : "",
            isToday ? "border-[#32d1aa]" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={key} className={cellClasses}>
              <div className="flex items-center justify-between">
                <span className={`text-[12px] font-[600] ${isToday ? "text-[#00c1bd]" : ""}`}>
                  {day.format("D")}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-[#6f7787]">
                    {dayEvents.length}건
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-[2px] mt-[6px]">
                {visibleEvents.map((event, index) => (
                  <div
                    key={`${event.worker}-${event.start}-${index}`}
                    className="flex items-center justify-between rounded-[6px] px-[6px] py-[2px]"
                    style={{ backgroundColor: getWorkerColor(event.worker) }}
                  >
                    <span className="text-[10px] font-[600] text-white truncate pr-1">
                      {event.worker}
                    </span>
                    <span className="text-[9px] font-[500] text-white">
                      {dayjs(event.start).format("HH:mm")}
                    </span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-[#6f7787]">
                    +{dayEvents.length - 3}개 일정
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthCalendar;
