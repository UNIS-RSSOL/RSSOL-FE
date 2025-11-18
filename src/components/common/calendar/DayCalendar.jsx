import { Table } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

function DayCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const workers = ["시현", "민솔", "서진", "지유", "시은", "혜민", "채은"];
  const events = [
    { worker: "시현", start: "2025-11-18 8:00", end: "2025-11-18 13:00" },
    { worker: "민솔", start: "2025-11-18 8:00", end: "2025-11-18 13:00" },
    { worker: "서진", start: "2025-11-18 13:00", end: "2025-11-18 18:00" },
    { worker: "지유", start: "2025-11-18 13:00", end: "2025-11-18 18:00" },
    { worker: "시은", start: "2025-11-18 18:00", end: "2025-11-18 23:00" },
    { worker: "혜민", start: "2025-11-18 18:00", end: "2025-11-18 24:00" },
    { worker: "채은", start: "2025-11-18 18:00", end: "2025-11-18 24:00" },
  ];
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];

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
    const totalHours = 15;
    const segmentSize = totalHours / 3;
    const hourInDay = startHour < 8 ? startHour + 24 : startHour;
    const normalizedHour = hourInDay - 8;
    return Math.min(2, Math.floor(normalizedHour / segmentSize));
  };

  const eventColors = events.reduce((acc, event) => {
    const startHour = dayjs(event.start).hour();
    const colorIndex = getColorIndex(startHour);
    acc[`${event.worker}-${event.start}-${event.end}`] = colors[colorIndex];
    return acc;
  }, {});

  return (
    <div className="flex flex-col w-full max-w-[360px] border-[0.5px] border-black rounded-[20px] bg-white items-center justify-center overflow-x-auto overflow-y-auto">
      <div className="flex border-b border-[#e7eaf3]">
        <div className="w-[66px] bg-white"></div>
        <div className="flex">
          {workers.map((worker) => (
            <div
              key={worker}
              className="w-[42px] h-[30px] border-l border-[#e7eaf3] bg-white text-center"
            ></div>
          ))}
        </div>
      </div>

      <div className="w-full">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex h-[35px] border-b border-[#e7eaf3] last:border-b-0"
          >
            <div className="w-[66px] flex-shrink-0 text-[16px] font-[400] text-center border-r border-[#e7eaf3] flex items-center justify-center">
              {String(hour)}:00
            </div>
            <div className="flex flex-1">
              {workers.map((worker) => {
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

                return (
                  <div
                    key={`${worker}-${hour}`}
                    className="w-[42px] h-full border-r border-[#e7eaf3] last:border-r-0 relative"
                    style={
                      event ? { backgroundColor: eventColors[eventKey] } : {}
                    }
                  >
                    {isMiddleHour && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[12px] font-[400] text-black ">
                          {worker}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DayCalendar;
