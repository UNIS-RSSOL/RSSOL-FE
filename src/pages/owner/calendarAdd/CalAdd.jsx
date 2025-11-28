import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import interactionPlugin from "@fullcalendar/interaction";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import "./CalAdd.css";

export default function CalAdd() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const handleDateClick = (info) => {
    const clicked = info.dateStr;
    if (selectedDates.length === 0) {
      setSelectedDates([clicked]);
    } else if (selectedDates.length === 1) {
      const first = selectedDates[0];
      const range = [first, clicked].sort();
      setSelectedDates(range);
    } else {
      setSelectedDates([clicked]);
    }
  };

  const dayCellClassNames = (arg) => {
    const dateStr = arg.dateStr;
    if (selectedDates.length === 1 && selectedDates[0] === dateStr) {
      return "fc-selected-start";
    }
    if (selectedDates.length === 2) {
      const [start, end] = selectedDates;
      if (dateStr === start) return "fc-selected-start";
      if (dateStr === end) return "fc-selected-end";
      if (dateStr > start && dateStr < end) return "fc-selected-between";
    }
    return "";
  };

  // --- 시간 슬롯 로직 (원래 코드 유지) ---
  const [unitSpecified, setUnitSpecified] = useState(true);
  const [timeSlots, setTimeSlots] = useState([
    { start: "09:00", end: "13:00", count: 0 },
  ]);
  const handleAddTime = () => {
    setTimeSlots([...timeSlots, { start: "00:00", end: "00:00", count: 0 }]);
  };
  const handleTimeChange = (index, field, value) => {
    const newSlots = [...timeSlots];
    newSlots[index][field] = value;
    setTimeSlots(newSlots);
  };

  // datesSet 콜백: 뷰가 바뀔 때(월 이동 등) 호출됨
  const handleDatesSet = (arg) => {
    const start = arg.start;
    const end = arg.end;
  
    // start ~ end 중간 날짜 구하기
    const midTime = (start.getTime() + end.getTime()) / 2;
    const midDate = new Date(midTime);
  
    setVisibleMonth({
      year: midDate.getFullYear(),
      month: midDate.getMonth() + 1,
    });
  };
  

  // 커스텀 prev / next
  const goPrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
  };
  const goNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
  };

  // visibleMonth를 "YYYY.MM" 형식으로 렌더
  const formattedTitle = `${visibleMonth.year}.${String(visibleMonth.month).padStart(2, "0")}`;

  return (
    <div className="w-full flex flex-col h-screen">
      <div className="shadow-sm">
        <TopBar title="근무표 생성" onBack={() => navigate(-1)} />
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* 커스텀 헤더 */}
        <div className="fc-custom-header flex items-center justify-between mb-2">
          <button className="fc-nav-btn" onClick={goPrev} aria-label="이전달">
            {/* 간단한 SVG 화살표 (검은색) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="fc-custom-title font-semibold text-lg">
            {formattedTitle}
          </div>

          <button className="fc-nav-btn" onClick={goNext} aria-label="다음달">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 6L15 12L9 18"
                stroke="#000"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="calendar-wrapper">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={koLocale}
            headerToolbar={false}
            fixedWeekCount={false}
            height="auto"
            dayCellContent={(arg) => {
              return { html: `<div class='date-num'>${arg.date.getDate()}</div>` };
            }}
            datesSet={handleDatesSet}   // 필수
          />
        </div>

        {/* --- 나머지 UI (시간 슬롯 등) --- */}
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

          {unitSpecified && (
            <div className="space-y-2">
              {timeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) =>
                      handleTimeChange(idx, "start", e.target.value)
                    }
                    className="border p-1 rounded w-24"
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) =>
                      handleTimeChange(idx, "end", e.target.value)
                    }
                    className="border p-1 rounded w-24"
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() =>
                        handleTimeChange(
                          idx,
                          "count",
                          Math.max(slot.count - 1, 0),
                        )
                      }
                      className="border rounded px-2"
                    >
                      -
                    </button>
                    <span>{slot.count}</span>
                    <button
                      onClick={() =>
                        handleTimeChange(idx, "count", slot.count + 1)
                      }
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
