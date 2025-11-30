import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import interactionPlugin from "@fullcalendar/interaction";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import { generateSchedule, confirmSchedule } from "../../../services/scheduleService.js";
import { fetchActiveStore } from "../../../services/owner/MyPageService.js";
import "./CalAdd.css";

export default function CalAdd() {
  const navigate = useNavigate();
  const calendarRef = useRef(null);

  const [minWorkTime, setMinWorkTime] = useState(1); // 최소 근무시간 (시간 단위)

  const [selectedDates, setSelectedDates] = useState([]);
  const [startDate, setStartDate] = useState(null); // 시작일자 저장
  const [endDate, setEndDate] = useState(null); // 마무리일자 저장
  const [storeId, setStoreId] = useState(null); // 매장 ID
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------
  // 월 계산 (FullCalendar의 start~end 중간 날짜 기준)
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

    // 🔥 중요: 달력 이동 시 selectedDates는 유지 (변경하지 않음)
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
      setStartDate(clicked);
      setEndDate(null);
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
      setStartDate(start);
      setEndDate(end);
      return;
    }

    setSelectedDates([clicked]);
    setStartDate(clicked);
    setEndDate(null);
  };

  // -------------------------
  // FullCalendar DOM 업데이트 (날짜 배경 반영)
  // -------------------------
  // visibleMonth가 변경되어도 selectedDates는 유지되도록 의존성에 추가
  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
  
    // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 업데이트
    setTimeout(() => {
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
    }, 0);
  }, [selectedDates, visibleMonth]);
  

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

  // -------------------------
  // 매장 ID 가져오기
  // -------------------------
  useEffect(() => {
    const loadStoreId = async () => {
      try {
        const activeStore = await fetchActiveStore();
        if (activeStore && activeStore.storeId) {
          setStoreId(activeStore.storeId);
        }
      } catch (error) {
        console.error("매장 ID 로드 실패:", error);
      }
    };
    loadStoreId();
  }, []);

  // -------------------------
  // 근무표 생성 핸들러
  // -------------------------
  const handleGenerateSchedule = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      if (unitSpecified) {
        // 지정함 - 날짜가 선택되어 있는 경우
        if (selectedDates.length !== 2) {
          alert("시작일자와 마무리일자를 모두 선택해주세요.");
          setIsLoading(false);
          return;
        }

        // 시간 슬롯 검증
        const validSlots = timeSlots.filter(
          (slot) => slot.start && slot.end && slot.count > 0
        );
        if (validSlots.length === 0) {
          alert("최소 하나의 시간 구간을 설정해주세요.");
          setIsLoading(false);
          return;
        }

        // 시간 구간을 백엔드 형식으로 변환
        const timeSegments = validSlots.map((slot) => ({
          startTime: `${slot.start}:00`,
          endTime: `${slot.end}:00`,
          requiredStaff: slot.count,
        }));

        // 오픈/마감 시간 계산 (가장 빠른 시작 시간과 가장 늦은 종료 시간)
        const allTimes = validSlots.flatMap((slot) => [slot.start, slot.end]);
        const sortedTimes = allTimes.sort();
        const openTime = `${sortedTimes[0]}:00`;
        const closeTime = `${sortedTimes[sortedTimes.length - 1]}:00`;

        // 근무표 생성 API 호출
        const result = await generateSchedule(
          storeId,
          openTime,
          closeTime,
          timeSegments,
          { candidateCount: 5 }
        );

        if (result && result.candidateScheduleKey) {
          // candidate 확정 시 시작일자/마무리일자 포함
          // 여기서는 생성만 하고, 확정은 별도 페이지에서 처리할 수 있음
          alert("근무표 후보가 생성되었습니다.");
          console.log("생성된 후보 키:", result.candidateScheduleKey);
          console.log("저장된 시작일자:", startDate);
          console.log("저장된 마무리일자:", endDate);
          // TODO: 후보 확인 페이지로 이동하거나 확정 로직 추가
        }
      } else {
        // 지정하지 않음 - 최소 근무시간으로 나눈 경우
        if (!storeId) {
          alert("매장 정보를 불러올 수 없습니다.");
          setIsLoading(false);
          return;
        }

        // 이 경우는 백엔드에서 자동으로 시간 구간을 나누므로
        // 추가 정보가 필요할 수 있음 (API 명세서 확인 필요)
        alert("지정하지 않음 옵션은 아직 구현 중입니다.");
      }
    } catch (error) {
      console.error("근무표 생성 실패:", error);
      alert("근무표 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------
  // candidate 확정 핸들러 (별도로 호출 가능)
  // -------------------------
  const handleConfirmSchedule = async (candidateKey, index) => {
    if (!startDate || !endDate) {
      alert("시작일자와 마무리일자를 선택해주세요.");
      return;
    }

    try {
      const result = await confirmSchedule(candidateKey, index, startDate, endDate);
      if (result && result.status === "success") {
        alert("근무표가 확정되었습니다.");
        navigate(-1);
      }
    } catch (error) {
      console.error("근무표 확정 실패:", error);
      alert("근무표 확정에 실패했습니다.");
    }
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

      <BottomBar 
        leftText="내 스케줄 추가하기" 
        rightText="근무표 생성하기"
        onRightClick={handleGenerateSchedule}
      />
    </div>
  );
}
