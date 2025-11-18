// CalAdd.jsx
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import TopBar from "../../../components/layout/alarm/TopBar";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import "./CalAdd.css";


export default function CalAdd() {
  const [selectedDates, setSelectedDates] = useState([]);

    const handleDateClick = (info) => {
      const clicked = info.dateStr;

      if (selectedDates.length === 0) {
        setSelectedDates([clicked]);
      } else if (selectedDates.length === 1) {
        const first = selectedDates[0];

        // 두 날짜 정렬
        const range = [first, clicked].sort();
        setSelectedDates(range);
      } else {
        // 다시 처음부터 선택
        setSelectedDates([clicked]);
      }
    };

    const dayCellClassNames = (arg) => {
      const dateStr = arg.dateStr;

      if (selectedDates.length === 1 && selectedDates[0] === dateStr) {
        return "fc-selected-start"; // 하나만 선택된 상태
      }

      if (selectedDates.length === 2) {
        const [start, end] = selectedDates;

        if (dateStr === start) return "fc-selected-start";
        if (dateStr === end) return "fc-selected-end";

        if (dateStr > start && dateStr < end) return "fc-selected-between";
      }
      return "";
    };

  const [unitSpecified, setUnitSpecified] = useState(true);
  const [timeSlots, setTimeSlots] = useState([{ start: "09:00", end: "13:00", count: 0 }]);

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
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={handleDateClick}
          dayCellClassNames={dayCellClassNames}
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
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={!unitSpecified}
              onChange={() => setUnitSpecified(false)}
            />
            <span>지정하지 않음</span>
          </label>
        </div>
      </div>

      <BottomBar leftText="내 스케줄 추가하기" rightText="근무표 생성하기" />
    </div>
  );
}
