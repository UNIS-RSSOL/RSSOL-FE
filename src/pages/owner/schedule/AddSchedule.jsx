import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import {
  getActiveStore,
  getOwnerStore,
} from "../../../services/MypageService.js";
import { requestScheduleInput } from "../../../services/ScheduleGenerationService.js";
// ✅ 알림 연동: /api/schedules/requests API 호출 시 백엔드에서 매장 내 직원들에게 자동으로 알림이 전송됩니다.
// 별도의 알림 API 호출이 필요하지 않습니다.
import HelpIcon from "../../../assets/icons/HelpIcon.jsx";
import BackArrowCircleIcon from "../../../assets/icons/BackArrowCircleIcon.jsx";
import PeopleIcon from "../../../assets/icons/PeopleIcon.jsx";
import "./AddSchedule.css";

// 백엔드 없을 때 UI 작업용 mock (API 실패 시 storeId 기본값만 사용)
const MOCK_STORE = { storeId: 1, storeName: "테스트 매장" };

export default function AddSchedule() {
  const navigate = useNavigate();

  const [selectedDates, setSelectedDates] = useState([]);
  const [startDate, setStartDate] = useState(null); // 시작일자 저장
  const [endDate, setEndDate] = useState(null); // 마무리일자 저장
  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("기간"); // 탭: 기간 | 인원
  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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
  // 기간 탭으로 돌아왔을 때도 선택 상태 유지: activeTab 의존성 추가
  useEffect(() => {
    if (activeTab !== "기간") return;
    const applySelection = () => {
        // 기존 클래스 제거
      const dayCells = document.querySelectorAll(".fc-daygrid-day");
      dayCells.forEach((cell) => {
          // 시작 날짜만 선택된 경우
        const dateStr = cell.getAttribute("data-date");
        if (!dateStr) return;
          // 사이 날짜는 적용하지 않음
          // 시작/끝 날짜와 사이 날짜 처리

        cell.classList.remove("range-start", "range-end", "range-between");

        if (selectedDates.length === 1) {
          if (selectedDates[0] === dateStr) cell.classList.add("range-start");
        } else if (selectedDates.length === 2) {
          const [start, end] = selectedDates;
          if (dateStr === start) cell.classList.add("range-start");
          else if (dateStr === end) cell.classList.add("range-end");
          else if (dateStr > start && dateStr < end)
            cell.classList.add("range-between");
        }
      });
    };
    const t = setTimeout(applySelection, 50);
    return () => clearTimeout(t);
  }, [selectedDates, activeTab]);

  // -------------------------
  // 시간 슬롯 (원본 유지)
  // -------------------------
  const [concurrentStaffCount, setConcurrentStaffCount] = useState(1);

  // 스크롤용 월 목록 (현재 월 기준 전후 6개월)
  const calendarMonths = useMemo(() => {
    const now = dayjs();
    const arr = [];
    for (let i = -6; i <= 6; i++) {
      arr.push(now.add(i, "month"));
    }
    return arr;
  }, []);

  const currentMonthRef = useRef(null);

  // -------------------------
  // 매장 ID 가져오기 (백엔드 없을 때 MOCK 사용 → UI 작업 가능)
  // -------------------------
  useEffect(() => {
    const loadStoreId = async () => {
      try {
        const activeStore = await getActiveStore();
        const id = activeStore?.storeId || activeStore?.id;
        if (id) setStoreId(id);
        else setStoreId(MOCK_STORE.storeId);
        const name = activeStore?.name || activeStore?.storeName;
        setStoreName(name || "매장");
      } catch (error) {
        setStoreId(MOCK_STORE.storeId);
        setStoreName("매장");
      }
    };
    loadStoreId();
  }, []);

  // -------------------------
  // 근무표 생성 핸들러
  // -------------------------
  // 기간 탭 진입 시 현재 월로 스크롤
  useEffect(() => {
    if (activeTab === "기간" && currentMonthRef.current) {
      currentMonthRef.current.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
    }
  }, [activeTab]);

  const totalPersonnel = concurrentStaffCount;

  // 팝업용 날짜 포맷 (2000.00.00)
  const formatForPopup = (d) =>
    d ? dayjs(d).format("YYYY.MM.DD") : "2000.00.00";
  const periodText =
    startDate && endDate
      ? `${formatForPopup(startDate)}-${formatForPopup(endDate)}`
      : "2000.00.00-2000.00.00";

  const handleRequestSchedule = async () => {
    // 기존 BottomBar onSingleClick 로직 실행
    try {
      setIsLoading(true);
      let currentStoreId = storeId;
      if (!currentStoreId) {
        try {
          const activeStore = await getActiveStore();
          const id = activeStore?.storeId || activeStore?.id;
          if (id) {
            currentStoreId = id;
            setStoreId(id);
          } else {
            try {
              const storedata = await getOwnerStore();
              const storeIdFromData = storedata?.storeId || storedata?.id;
              if (storeIdFromData) {
                currentStoreId = storeIdFromData;
                setStoreId(storeIdFromData);
              }
            } catch (_) {}
          }
        } catch (_) {}
      }
      if (!currentStoreId) {
        alert("매장 정보를 불러올 수 없습니다. 다시 시도해주세요.");
        setIsLoading(false);
        setShowRequestPopup(false);
        return;
      }
      if (!startDate || !endDate) {
        alert("시작일자와 마무리일자를 모두 선택해주세요.");
        setIsLoading(false);
        setShowRequestPopup(false);
        return;
      }
      const openTime = "09:00:00";
      const closeTime = "18:00:00";
      const timeSegments = [
        {
          startTime: openTime,
          endTime: closeTime,
          requiredStaff: concurrentStaffCount,
        },
      ];
      const storeIdToSend = Number(currentStoreId);
      if (isNaN(storeIdToSend) || !storeIdToSend) {
        alert("매장 정보를 불러올 수 없습니다. 다시 시도해주세요.");
        setIsLoading(false);
        setShowRequestPopup(false);
        return;
      }
      const requestData = {
        storeId: storeIdToSend,
        openTime,
        closeTime,
        startDate:
          startDate ||
          dayjs().locale("ko").startOf("week").format("YYYY-MM-DD"),
        endDate:
          endDate ||
          dayjs()
            .locale("ko")
            .startOf("week")
            .add(6, "day")
            .format("YYYY-MM-DD"),
      };
      requestData.timeSegments = timeSegments;
      const result = await requestScheduleInput(
        storeIdToSend,
        requestData.openTime,
        requestData.closeTime,
        requestData.startDate,
        requestData.endDate,
        requestData.timeSegments,
      );
      const scheduleRequestId = result?.scheduleRequestId || result?.id || result?.requestId;
      if (result && scheduleRequestId) {
        localStorage.setItem("hasScheduleRequest", "true");
        localStorage.removeItem("scheduleGenerationCompleted");
        const scheduleConfigData = {
          scheduleRequestId,
          timeSegments,
          openTime,
          closeTime,
          minWorkTime: null,
          startDate: requestData.startDate,
          endDate: requestData.endDate,
        };
        localStorage.setItem("scheduleConfig", JSON.stringify(scheduleConfigData));
        setShowRequestPopup(false);
        navigate("/owner/schedule/list", { state: scheduleConfigData });
      } else {
        alert("근무표 생성 요청에 실패했습니다.");
      }
    } catch (error) {
      console.error("근무표 생성 요청 실패:", error);
      alert("근무표 생성 요청에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const weekdays = [
    { label: "일", color: "#E53935" },
    { label: "월", color: "#2d2d2d" },
    { label: "화", color: "#2d2d2d" },
    { label: "수", color: "#2d2d2d" },
    { label: "목", color: "#2d2d2d" },
    { label: "금", color: "#2d2d2d" },
    { label: "토", color: "#1976D2" },
  ];

  return (
    <div className="add-schedule-page w-full flex flex-col h-screen">
      <div className="flex items-center justify-between h-[60px] px-4 bg-white shadow-[0_4px_8px_0_rgba(0,0,0,0.08)] flex-shrink-0">
        <span className="text-[18px] font-semibold text-gray-900">
          {storeName || "매장"}
        </span>
        <button
          type="button"
          className="add-schedule-help-btn"
          aria-label="도움말"
          onClick={() => setShowHelpModal(true)}
        >
          <HelpIcon />
        </button>
      </div>

      <div
        className="flex-1 overflow-auto calendar-scroll-hide-bar add-schedule-content-with-bar bg-white"
      >
        <div
          className="calendar-scroll-container p-4 space-y-6 bg-white relative"
          style={{ display: activeTab === "기간" ? undefined : "none" }}
          aria-hidden={activeTab !== "기간"}
        >
          <div className="calendar-weekday-bar-sticky">
            <div className="calendar-weekday-bar">
              {weekdays.map((d) => (
                <div
                  key={d.label}
                  className="calendar-weekday-cell"
                  style={{ color: d.color }}
                >
                  {d.label}
                </div>
              ))}
            </div>
          </div>
          {calendarMonths.map((month) => {
            const isCurrentMonth =
              month.isSame(dayjs(), "month");
            const initialDate = month.format("YYYY-MM-01");
            return (
              <div
                key={initialDate}
                ref={isCurrentMonth ? currentMonthRef : null}
                className="calendar-month-block"
              >
                <div className="fc-custom-title text-lg font-semibold mb-2 text-left">
                  {month.format("YYYY.MM")}
                </div>
                <div className="calendar-wrapper">
                  <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    initialDate={initialDate}
                    locale={koLocale}
                    headerToolbar={false}
                    fixedWeekCount={false}
                    height="auto"
                    dateClick={handleDateClick}
                    dayCellContent={(arg) => ({
                      html: `<div class='date-num'>${arg.date.getDate()}</div>`,
                    })}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="p-4 space-y-6 schedule-unit-container bg-white"
          style={{ display: activeTab === "인원" ? undefined : "none" }}
          aria-hidden={activeTab !== "인원"}
        >
          <div className="flex items-center gap-4 w-fit">
            <div className="text-left w-fit">
              <h2 className="text-xl font-bold mb-2 whitespace-nowrap">
                동시 근무자 수를 알려주세요!
              </h2>
              <p className="text-base font-medium whitespace-nowrap">저장된 파트 타임 구간이 없어요.</p>
            </div>
            <div className="text-right w-fit">
              <button
                type="button"
                className="create-schedule-btn w-fit whitespace-nowrap text-sm font-semibold"
              >
                생성하기
              </button>
            </div>
          </div>
          <div className="concurrent-staff-container">
            <div className="flex items-center gap-2">
              <PeopleIcon />
              <span className="concurrent-staff-label">동시 근무자 수</span>
            </div>
            <div className="concurrent-staff-controls">
              <button
                type="button"
                className="concurrent-staff-btn w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-medium"
                onClick={() =>
                  setConcurrentStaffCount((c) => Math.max(1, c - 1))
                }
              >
                -
              </button>
              <span className="min-w-[24px] text-center font-semibold">
                {concurrentStaffCount}
              </span>
              <button
                type="button"
                className="concurrent-staff-btn w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-medium"
                onClick={() => setConcurrentStaffCount((c) => c + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        {/* 커스텀 하단바: sticky, 달력 위에 겹침, 바깥 배경 투명 */}
        <div className="add-schedule-bottom-bar-sticky">
          <div className="add-schedule-bottom-bar add-schedule-bottom-bar-flex">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="add-schedule-bottom-bar-item add-schedule-bottom-bar-back"
              aria-label="이전"
            >
              <BackArrowCircleIcon className="w-10 h-10" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("기간")}
              className={`add-schedule-bottom-bar-item add-schedule-bottom-bar-tab ${
                activeTab === "기간" ? "add-schedule-bottom-bar-tab-active" : ""
              }`}
            >
              기간
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("인원")}
              className={`add-schedule-bottom-bar-item add-schedule-bottom-bar-tab ${
                activeTab === "인원" ? "add-schedule-bottom-bar-tab-active" : ""
              }`}
            >
              인원
            </button>
            <button
              type="button"
              onClick={() => setShowRequestPopup(true)}
              className="add-schedule-request-btn add-schedule-bottom-bar-item"
            >
              근무표 요청
            </button>
          </div>
        </div>
      </div>

      {/* 근무표 요청 팝업 */}
      {showRequestPopup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowRequestPopup(false)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-[390px] p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <p className="text-base font-medium">
                근무 기간: {periodText}
              </p>
              <p className="text-base font-medium">
                근무 인원: {totalPersonnel}명
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRequestPopup(false)}
                className="flex-1 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700"
              >
                수정하기
              </button>
              <button
                type="button"
                onClick={handleRequestSchedule}
                disabled={isLoading}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#68E194] text-black disabled:opacity-60"
              >
                요청하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 도움말 모달 */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-[390px] p-6 space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label="닫기"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* 모달 내용 */}
            <div className="space-y-4 pr-8">
              <h3 className="text-xl font-bold text-gray-900">근무표 생성 방법</h3>
              <div className="space-y-3 text-base text-gray-700 leading-relaxed">
                <p>
                  <span className="font-semibold">1.</span> 기간 탭을 눌러 근무표를 생성하고자 하는 기간을 설정해주세요.
                </p>
                <p>
                  <span className="font-semibold">2.</span> 인원 탭을 눌러 근무시간대에 배치될 인원을 설정해주세요.
                  <br />
                  만약, 매장 정보에 저장된 파트타임이 있다면 파트타임별 근무인원 배치가 가능해요.
                  <br />
                  저장된 파트타임이 없다면 한시간 간격으로 나누어 근무표 생성이 돼요.
                </p>
                <p>
                  <span className="font-semibold">3.</span> 근무표 요청 버튼을 눌러 입력한 정보가 맞는지 확인해주세요. 맞다면 요청하기 버튼을, 틀렸다면 수정하기 버튼을 눌러주세요.
                  <br />
                  요청하기 버튼을 누르면 매장 내 근무자들에게 근무표 제출 알람이 가요.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
