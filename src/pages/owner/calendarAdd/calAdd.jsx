// CalAdd.jsx
import React, { useState } from "react";
import { Calendar } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import TopBar from "../../../components/layout/alarm/TopBar";

export default function CalAdd() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [unitSpecified, setUnitSpecified] = useState(true);
  const [timeSlots, setTimeSlots] = useState([{ start: "09:00", end: "13:00", count: 0 }]);

  const handleDateClick = (info) => {
    const dateStr = info.dateStr;
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleAddTime = () => {
    setTimeSlots([...timeSlots, { start: "00:00", end: "00:00", count: 0 }]);
  };

  const handleTimeChange = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar title="근무표 생성" />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* FullCalendar */}
        <Calendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          dayCellClassNames={(arg) =>
            selectedDates.includes(arg.dateStr) ? "bg-green-200 rounded" : ""
          }
        />

        {/* 근무표 생성 단위 */}
        <div className="space-y-2">
          <div className="font-semibold">근무표 생성 단위</div>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={unitSpecified}
              onChange={() => setUnitSpecified(true)}
            />
            <span>지정함</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={!unitSpecified}
              onChange={() => setUnitSpecified(false)}
            />
            <span>지정하지 않음</span>
          </label>

          {/* 시간 입력 UI */}
          {unitSpecified && (
            <div className="space-y-2">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => handleTimeChange(idx, "start", e.target.value)}
                    className="border p-1 rounded w-24"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => handleTimeChange(idx, "end", e.target.value)}
                    className="border p-1 rounded w-24"
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() =>
                        handleTimeChange(idx, "count", Math.max(slot.count - 1, 0))
                      }
                      className="border rounded px-2"
                    >
                      -
                    </button>
                    <span>{slot.count}</span>
                    <button
                      onClick={() => handleTimeChange(idx, "count", slot.count + 1)}
                      className="border rounded px-2"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddTime}
                className="text-green-600 text-sm font-semibold"
              >
                + 타임 추가
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomBar leftText="내 스케줄 추가하기" rightText="근무표 생성하기" />
    </div>
  );
}
