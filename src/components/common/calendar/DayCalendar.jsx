import { Table } from "antd";
import dayjs from "dayjs";
import { useState } from "react";

function DayCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const hours = Array.from({ length: 17 }, (_, i) => i + 8);
  const workers = ["시현", "민솔", "서진", "지유", "시은", "혜민", "채은"];

  return (
    <div className="w-full max-w-[360px] border-[0.5px] border-black rounded-[20px] bg-white overflow-x-auto">
      {/* Header with fixed first column and scrollable worker columns */}
      <div className="flex border-b border-[#e7eaf3]">
        <div className="w-[60px] bg-white"></div>
        <div className="flex">
          {workers.map((worker) => (
            <div
              key={worker}
              className="w-[40px] flex-shrink-0 py-1 border-l border-[#e7eaf3] bg-white text-center"
            >
              {worker}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex h-[40px] border-b border-[#e7eaf3] last:border-b-0"
          >
            <div className="w-[60px] flex-shrink-0 p-2 text-[16px] font-[400] text-center border-r border-[#e7eaf3] flex items-center justify-center">
              {String(hour).padStart(2, "0")}:00
            </div>
            <div className="flex">
              {workers.map((worker) => (
                <div
                  key={`${worker}-${hour}`}
                  className="w-[40px] flex-shrink-0 h-[40px] border-r border-[#e7eaf3] last:border-r-0 hover:bg-gray-50"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DayCalendar;
