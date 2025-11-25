import { Table } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(weekOfYear);
import { useEffect, useState } from "react";

function WeekCalendar({ date }) {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const startOfWeek = date.startOf("week").add(1, "day");
  const week = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
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

  const getEventForCell = (worker, day) => {
    return events.find((event) => {
      if (
        event.worker !== worker ||
        event.start.trim()[0] !== day.format("YYYY-MMDD")
      )
        return false;
      return true;
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
    <div className="flex flex-col w-full max-w-[360px] border-[0.5px] border-black rounded-[20px] bg-white items-center justify-center overflow-x-hidden overflow-y-auto">
      <div className="flex border-b border-[#e7eaf3]">
        <div className="w-[52px] bg-white"></div>
        <div className="flex">
          {days.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center w-[44px] h-[30px] border-l border-[#e7eaf3] bg-white text-center"
            >
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="flex border-b border-[#e7eaf3]">
        <div className="w-[52px] bg-white"></div>
        <div className="flex">
          {week.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center w-[44px] h-[30px] border-l border-[#e7eaf3] bg-white text-center"
            >
              {day.format("DD")}
            </div>
          ))}
        </div>
      </div>
      <div className="w-full">
        {workers.map((worker) => (
          <div
            key={worker}
            className="flex h-[55px] border-b border-[#e7eaf3] last:border-b-0"
          >
            <div className="w-[52px] flex-shrink-0 text-[16px] font-[400] text-center border-r border-[#e7eaf3] flex items-center justify-center">
              {worker}
            </div>
            <div className="flex flex-1">
              {week.map((day) => {
                const event = getEventForCell(worker, day);
                const eventKey = event
                  ? `${event.worker}-${event.start}-${event.end}`
                  : null;

                return (
                  <div
                    key={`${worker}-${day}`}
                    className="w-[44px] h-full border-r border-[#e7eaf3] last:border-r-0 relative"
                    style={
                      event ? { backgroundColor: eventColors[eventKey] } : {}
                    }
                  ></div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeekCalendar;
