import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { fetchSchedules } from "../../../services/common/ScheduleService";

function ResourceCalendar({ e, w }) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const [workers, setWorkers] = useState([]);
  const [events, setEvents] = useState([]);
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];

  useEffect(() => {
    setWorkers(w);
    setEvents(e);
  }, []);

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
    <div className="flex flex-row overflow-x-hidden w-full">
      <div className="flex-shrink-0 w-[60px] border-r border-[#e7eaf3]">
        <div className="h-[35px]" />
        {workers.map((worker) => (
          <div
            key={worker}
            className="h-[35px] flex items-center justify-center border-t border-[#e7eaf3]"
          >
            {worker}
          </div>
        ))}
      </div>
      <div className="flex flex-col w-full overflow-x-auto">
        <div className="flex flex-row h-[35px] w-full">
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex flex-shrink-0 w-[40px] text-[16px] font[400] border-r border-[#e7eaf3] items-center justify-center"
            >
              {hour}
            </div>
          ))}
        </div>
        {workers.map((worker) => (
          <div key={worker} className="flex flex-shrink-0 flex-row h-[35px]">
            {hours.map((hour) => {
              const event = getEventForCell(worker, hour);
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
                  className="flex flex-shrink-0 h-full w-[40px] border-r border-t border-[#e7eaf3]"
                  style={{ backgroundColor: getEventColor(event) }}
                >
                  {isMiddleHour ? (
                    <span className="text-black text-[12px] font-[400]"></span>
                  ) : null}
                </div>
              ) : (
                <div
                  key={`${worker}-${hour}`}
                  className="flex flex-shrink-0 h-full w-[40px] border-r border-t border-[#e7eaf3]"
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResourceCalendar;
