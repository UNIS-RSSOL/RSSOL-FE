import React, { useState, useRef, useEffect } from "react";
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

  const [minWorkTime, setMinWorkTime] = useState(1); // 최소 근무시간 (시간 단위)

  const [selectedDates, setSelectedDates] = useState([]);

  // -------------------------
  // 🔥 월 계산: FullCalendar의 start~end 중간 날짜 기준
  // -------------------------
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

  const handleDatesSet = (arg) => {
    const start = arg.start;
    const end = arg.end;

    // start = ex) 2025-10-26
    // end   = ex) 2025-12-07 (다음 달 일부 포함)
    // ▶ 중간 날짜를 잡으면 현재 화면에 보이는 달이 정확히 잡힘
    const midTime = (start.getTime() + end.getTime()) / 2;
    const midDate = new Date(midTime);

    setVisibleMonth({
      year: midDate.getFullYear(),
      month: midDate.getMonth() + 1,
    });
  };

  // -------------------------
  // 날짜 선택 로직
  // -------------------------
  const handleDateClick = (info) => {
    const clicked = info.dateStr;

    if (selectedDates.length === 0) {
      setSelectedDates([clicked]);
      return;
    }

    if (selectedDates.length === 1) {
      const first = selectedDates[0];
      let start = first;
      let end = clicked;

      if (clicked < first) {
        start = clicked;
        end = first;
      }

      setSelectedDates([start, end]);
      return;
    }

    setSelectedDates([clicked]);
  };

  // -------------------------
  // 🔥 FullCalendar DOM 업데이트 (날짜 배경 반영)
  // -------------------------
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
  
    api.render();
  
    const dayCells = document.querySelectorAll(".fc-daygrid-day");
    dayCells.forEach((cell) => {
      const dateStr = cell.getAttribute("data-date");
      if (!dateStr) return;
  
      // 기존 클래스 제거
      cell.classList.remove("range-start", "range-end", "range-between");
  
      if (selectedDates.length === 1) {
        // 시작 날짜만 선택된 경우
        if (selectedDates[0] === dateStr) cell.classList.add("range-start");
        // 사이 날짜는 적용하지 않음
      } else if (selectedDates.length === 2) {
        // 시작/끝 날짜와 사이 날짜 처리
        const [start, end] = selectedDates;
        if (dateStr === start) cell.classList.add("range-start");
        else if (dateStr === end) cell.classList.add("range-end");
        else if (dateStr > start && dateStr < end) cell.classList.add("range-between");
      }
    });
  }, [selectedDates]);
  

  // -------------------------
  // 시간 슬롯 (원본 유지)
  // -------------------------
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

  const goPrev = () => {
    const api = calendarRef.current?.getApi();
    api?.prev();
  };

  const goNext = () => {
    const api = calendarRef.current?.getApi();
    api?.next();
  };

  const formattedTitle = `${visibleMonth.year}.${String(
    visibleMonth.month
  ).padStart(2, "0")}`;

  return (
    <div className="w-full flex flex-col h-screen">
      <TopBar title="근무표 생성" onBack={() => navigate(-1)} />

      <div className="flex-1 p-4 space-y-4 h-flex">
        {/* ---------- 커스텀 헤더 ---------- */}
        <div className="fc-custom-header flex items-center justify-between mb-2">
          <button className="fc-nav-btn" onClick={goPrev}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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

          <button className="fc-nav-btn" onClick={goNext}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
      
        {/* ---------- 달력 ---------- */}
        <div className="calendar-wrapper">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={koLocale}
            headerToolbar={false}
            fixedWeekCount={false}
            height="auto"
            dateClick={handleDateClick}
            datesSet={handleDatesSet}
            dayCellContent={(arg) => ({
              html: `<div class='date-num'>${arg.date.getDate()}</div>`,
            })}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* ---------- 시간 슬롯 ---------- */}
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
                    className="border p-1 rounded w-24"
                    onChange={(e) =>
                      handleTimeChange(idx, "start", e.target.value)
                    }
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={slot.end}
                    className="border p-1 rounded w-24"
                    onChange={(e) =>
                      handleTimeChange(idx, "end", e.target.value)
                    }
                  />

                  <div className="flex items-center space-x-1">
                    <button
                      className="border rounded px-2"
                      onClick={() =>
                        handleTimeChange(
                          idx,
                          "count",
                          Math.max(slot.count - 1, 0)
                        )
                      }
                    >
                      -
                    </button>
                    <span>{slot.count}</span>
                    <button
                      className="border rounded px-2"
                      onClick={() =>
                        handleTimeChange(idx, "count", slot.count + 1)
                      }
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
          {!unitSpecified && (
            <div className="mt-2 space-y-1">
              <div className="font-medium">
                최소 근무시간
                <input
                  type="number"
                  min="1"
                  value={minWorkTime}
                  className="border p-1 rounded w-12"
                  onChange={(e) => setMinWorkTime(e.target.value)}
                />
                <span>시간</span>
              </div>
            </div>
          )}

        </div>
      </div>

      <BottomBar leftText="내 스케줄 추가하기" rightText="근무표 생성하기" />
    </div>
  );
}
