import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { fetchSchedules } from "../../../services/CalendarService.js";

function DayCalendar({ date }) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const [blank, setBlank] = useState(Array.from({ length: 7 }, () => "."));
  const [workers, setWorkers] = useState([]);

  const [events, setEvents] = useState([]);
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];

  useEffect(() => {
    (async () => {
      try {
        const schedules = await fetchSchedules(
          date.format("YYYY-MM-DD"),
          date.format("YYYY-MM-DD"),
        );
        const uniqueWorkers = [
          ...new Set(schedules.map((shedule) => schedules.userStoreId)),
        ];
        const formattedEvents = schedules.map((schedule) => ({
          worker: schedule.userStoreId,
          start: schedule.startDatetime,
          end: schedule.endDatetime,
        }));

        setWorkers(uniqueWorkers);
        setEvents(formattedEvents);

        const len = uniqueWorkers?.length || 0;
        const newBlank = Array.from(
          { length: Math.max(0, 7 - len) },
          () => ".",
        );
        setBlank(newBlank);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    })();
  }, [date]);

  const getEventForCell = (worker, hour) => {
    return events.find((event) => {
      if (event.worker !== worker) return false;
      const startHour = dayjs(event.start).hour();
      let endHour = dayjs(event.end).hour();
      if (endHour === 0) endHour = 24;
      return hour >= startHour && hour < endHour;
    });
  };

  const getColorIndex = (startHour) => {
    const totalHours = hours.length - 1;
    const segmentSize = Math.trunc(totalHours / colors.length);
    const normalizedHour = startHour - hours[0];
    return Math.min(
      colors.length - 1,
      Math.floor(normalizedHour / segmentSize),
    );
  };

  const getEventColor = (event) => {
    if (!event) return "white";
    const startHour = dayjs(event.start).hour();
    const colorIndex = getColorIndex(startHour);
    return colors[colorIndex];
  };

  return (
    <div className="flex flex-row w-full max-w-[362px] border-[0.5px] border-black rounded-[20px] bg-white items-center overflow-x-auto">
      <div className="flex-shrink-0 flex-col w-[66px]">
        <div className="h-[35px] border-b border-[#e7eaf3]" />
        {hours.map((hour) => (
          <div key={hour}>
            <div className="flex h-[35px] items-center justify-center border-b border-[#e7eaf3]">
              {String(hour)}:00
            </div>
          </div>
        ))}
      </div>
      {workers.map((worker, index) => (
        <div
          key={worker}
          className="flex-shrink-0 flex-col w-[42px] border-[#e7eaf3]"
        >
          <div className="h-[35px] border-b border-[#e7eaf3]" />

          {hours.map((hour) => {
            const event = getEventForCell(worker, hour);
            const eventKey = event
              ? `${event.worker}-${event.start}-${event.end}`
              : null;
            const isMiddleHour = (() => {
              if (!event) return false;
              const startHour = dayjs(event.start).hour();
              let endHour = dayjs(event.end).hour();
              if (endHour === 0) endHour = 24;
              const middleHour = Math.floor((startHour + endHour - 1) / 2);
              return hour === middleHour;
            })();
            return event ? (
              <div
                key={`${worker}-${hour}`}
                className="flex h-[35px] items-center justify-center border-b border-[#e7eaf3]"
                style={{ backgroundColor: getEventColor(event) }}
              >
                {isMiddleHour ? (
                  <span className="text-black text-[12px] font-[400]">
                    {worker}
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                key={`${worker}-${hour}`}
                className="flex h-[35px] border-b border-[#e7eaf3] bg-white"
              />
            );
          })}
        </div>
      ))}
      {blank &&
        blank.map((blank, index) => (
          <div
            key={index}
            className={`flex-shrink-0 flex-col w-[42px] border-r border-[#e7eaf3] last:border-r-0 ${index === 0 ? "border-l" : ""}`}
          >
            <div className="h-[35px] border-b border-[#e7eaf3]" />
            {hours.map((hour) => (
              <div key={hour}>
                <div className="flex h-[35px] items-center justify-center border-b border-[#e7eaf3]" />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default DayCalendar;
