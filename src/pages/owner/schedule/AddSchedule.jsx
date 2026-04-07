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
import { getActiveStoreSettings } from "../../../services/StoreSettingService.js";
// ✅ 알림 연동: /api/schedules/requests API 호출 시 백엔드에서 매장 내 직원들에게 자동으로 알림이 전송됩니다.
// 별도의 알림 API 호출이 필요하지 않습니다.
import HelpIcon from "../../../assets/icons/HelpIcon.jsx";
import BackArrowCircleIcon from "../../../assets/icons/BackArrowCircleIcon.jsx";
import PeopleIcon from "../../../assets/icons/PeopleIcon.jsx";
import "./AddSchedule.css";

// 백엔드 없을 때 UI 작업용 mock (API 실패 시 storeId 기본값만 사용)
const MOCK_STORE = { storeId: 1, storeName: "테스트 매장" };

// 파트 타임 라벨
const getPartTimeLabel = (index) => {
  if (index === 0) return "오픈";
  if (index === 1) return "미들";
  if (index === 2) return "마감";
  return `구간 ${index + 1}`;
};

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
  
  // 파트타임 구간 관련 상태
  const [partTimeSegments, setPartTimeSegments] = useState([]); // 파트타임 구간 목록
  const [partTimePersonnel, setPartTimePersonnel] = useState({}); // 각 구간별 인원 수 { "0": 1, "1": 1, "2": 1 }
  const [hasPartTimeSegments, setHasPartTimeSegments] = useState(false); // 파트타임 구간 존재 여부
  const [isLoadingPartTime, setIsLoadingPartTime] = useState(false);

  const redirectToStoreSettings = (message) => {
    alert(message || "매장 설정을 먼저 완료해주세요.");
    navigate("/owner/store-settings");
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

        // 다른 달의 날짜(fc-day-other)에는 선택 스타일 적용하지 않음
        if (cell.classList.contains("fc-day-other")) return;

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
  // 파트타임 구간 조회
  // -------------------------
  useEffect(() => {
    const loadPartTimeSegments = async () => {
      if (!storeId) return;
      
      // ============================================
      // 🧪 임시 테스트 모드: 파트타임 구간 화면 확인용
      // 화면 확인 후 아래 3줄을 주석 처리하거나 삭제하세요
      // ============================================
      const TEST_MODE = false; // false로 변경하면 실제 API 호출
      if (TEST_MODE) {
        const testSegments = [
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "13:00", endTime: "18:00" },
          { startTime: "19:00", endTime: "22:00" },
        ];
        setPartTimeSegments(testSegments);
        setHasPartTimeSegments(true);
        setPartTimePersonnel({ 0: 1, 1: 1, 2: 1 });
        setIsLoadingPartTime(false);
        return;
      }
      // ============================================
      
      setIsLoadingPartTime(true);
      try {
        const settings = await getActiveStoreSettings();
        const segments = settings?.segments || settings?.partTimeSegments || settings?.partTimes || [];

        if (!settings) {
          redirectToStoreSettings("매장 설정을 먼저 완료해주세요.");
          return;
        }

        if (segments.length > 0 && settings.useSegments !== false) {
          setPartTimeSegments(segments);
          setHasPartTimeSegments(true);
        } else {
          setHasPartTimeSegments(false);
        }
        const initialPersonnel = {};
        segments.forEach((_, index) => {
          initialPersonnel[index] = 1;
        });
        setPartTimePersonnel(initialPersonnel);
      } catch (error) {
        console.error("파트타임 구간 조회 실패:", error);
        const serverMessage =
          error.response?.data?.message || error.response?.data?.error || "";
        if (
          error.response?.status === 404 ||
          serverMessage.includes("매장 기본 설정이 존재하지 않습니다") ||
          serverMessage.includes("매장 설정을 찾을 수 없습니다")
        ) {
          redirectToStoreSettings("매장 설정을 먼저 완료해주세요.");
          return;
        }
        alert("매장 설정 조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoadingPartTime(false);
      }
    };
    
    loadPartTimeSegments();
  }, [storeId]);

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
      try {
        const settings = await getActiveStoreSettings();
        const segments = settings?.segments || settings?.partTimeSegments || settings?.partTimes || [];
        if (!settings) {
          setShowRequestPopup(false);
          setIsLoading(false);
          redirectToStoreSettings("매장 설정을 먼저 완료해주세요.");
          return;
        }
      } catch (settingsError) {
        const serverMessage =
          settingsError.response?.data?.message ||
          settingsError.response?.data?.error ||
          "";
        if (
          settingsError.response?.status === 404 ||
          serverMessage.includes("매장 기본 설정이 존재하지 않습니다") ||
          serverMessage.includes("매장 설정을 찾을 수 없습니다")
        ) {
          setShowRequestPopup(false);
          setIsLoading(false);
          redirectToStoreSettings("매장 설정을 먼저 완료해주세요.");
          return;
        }
        throw settingsError;
      }
      if (!startDate || !endDate) {
        alert("시작일자와 마무리일자를 모두 선택해주세요.");
        setIsLoading(false);
        setShowRequestPopup(false);
        return;
      }
      
      // 파트타임 구간이 있으면 각 구간별로 timeSegments 생성, 없으면 전체 시간대에 동시 근무자 수 적용
      let timeSegments = [];
      let openTime = "09:00:00";
      let closeTime = "18:00:00";
      
      if (hasPartTimeSegments && partTimeSegments.length > 0) {
        // 파트타임 구간별로 timeSegments 생성
        timeSegments = partTimeSegments.map((segment, index) => {
          const startTime = segment.startTime || segment.start || "09:00:00";
          const endTime = segment.endTime || segment.end || "18:00:00";
          const requiredStaff = partTimePersonnel[index] || 1;
          
          // 첫 구간의 시작 시간을 openTime으로, 마지막 구간의 종료 시간을 closeTime으로 설정
          if (index === 0) {
            openTime = startTime.includes(":") && startTime.length === 5 
              ? `${startTime}:00` 
              : startTime;
          }
          if (index === partTimeSegments.length - 1) {
            closeTime = endTime.includes(":") && endTime.length === 5 
              ? `${endTime}:00` 
              : endTime;
          }
          
          return {
            startTime: startTime.includes(":") && startTime.length === 5 
              ? `${startTime}:00` 
              : startTime,
            endTime: endTime.includes(":") && endTime.length === 5 
              ? `${endTime}:00` 
              : endTime,
            requiredStaff,
          };
        });
      } else {
        // 파트타임 구간이 없으면 전체 시간대에 동시 근무자 수 적용
        timeSegments = [
          {
            startTime: openTime,
            endTime: closeTime,
            requiredStaff: concurrentStaffCount,
          },
        ];
      }
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
      
      // 더 자세한 오류 메시지 표시
      let errorMessage = "근무표 생성 요청에 실패했습니다. 다시 시도해주세요.";
      
      if (error.response) {
        // 서버 응답이 있는 경우
        const status = error.response.status;
        if (status === 404) {
          const serverMessage =
            error.response.data?.message || error.response.data?.error || "";
          if (serverMessage.includes("매장 기본 설정이 존재하지 않습니다") || serverMessage.includes("매장 설정을 찾을 수 없습니다")) {
            setShowRequestPopup(false);
            redirectToStoreSettings("매장 설정을 먼저 완료해주세요.");
            return;
          }
          errorMessage = "API 엔드포인트를 찾을 수 없습니다. 관리자에게 문의해주세요.";
        } else if (status === 400) {
          errorMessage = "요청 데이터가 올바르지 않습니다. 입력 정보를 확인해주세요.";
        } else if (status === 401 || status === 403) {
          errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
        } else if (status >= 500) {
          errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        }
        
        // 서버에서 보낸 오류 메시지가 있으면 표시
        const serverMessage = error.response.data?.message || error.response.data?.error;
        if (serverMessage) {
          errorMessage += `\n\n오류 내용: ${serverMessage}`;
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
      }
      
      alert(errorMessage);
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
        <div className="flex items-center justify-between h-[60px] px-3 sm:px-4 bg-white border-b border-[#e7eaf3] flex-shrink-0 gap-2">
        <span className="text-base sm:text-[18px] font-semibold text-gray-900 truncate min-w-0 flex-1">
          {storeName || "매장"}
        </span>
        <button
          type="button"
          className="add-schedule-help-btn flex-shrink-0"
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
          className="calendar-scroll-container p-3 sm:p-4 space-y-4 sm:space-y-6 bg-white relative"
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
          className="p-3 sm:p-4 space-y-4 sm:space-y-6 schedule-unit-container bg-white"
          style={{ display: activeTab === "인원" ? undefined : "none" }}
          aria-hidden={activeTab !== "인원"}
        >
          {isLoadingPartTime ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-base text-gray-500">로딩 중...</span>
            </div>
          ) : hasPartTimeSegments ? (
            // 파트타임 구간이 있는 경우
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
                <div className="text-left flex-1 min-w-0">
                  <h2 className="text-xl font-bold mb-2 break-keep">
                    이대로 진행할까요?
                  </h2>
                  <p className="text-base font-medium break-keep">저장된 파트 타임 구간이 있어요.</p>
                </div>
                <div className="text-right sm:text-right flex-shrink-0">
                  <button
                    type="button"
                    className="create-schedule-btn w-fit text-sm font-semibold"
                    onClick={() => navigate("/owner/store-settings")}
                  >
                    수정하기
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {partTimeSegments.map((segment, index) => {
                  const startTime = segment.startTime || segment.start || "09:00";
                  const endTime = segment.endTime || segment.end || "18:00";
                  const personnel = partTimePersonnel[index] || 1;
                  
                  return (
                    <div key={index} className="concurrent-staff-container">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="concurrent-staff-label font-semibold min-w-[50px] sm:min-w-[60px] flex-shrink-0">
                          {getPartTimeLabel(index)}
                        </span>
                        <span className="concurrent-staff-label text-gray-600 break-keep">
                          {startTime}-{endTime}
                        </span>
                      </div>
                      <div className="concurrent-staff-controls">
                        <button
                          type="button"
                          className="concurrent-staff-btn w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-medium"
                          onClick={() =>
                            setPartTimePersonnel((prev) => ({
                              ...prev,
                              [index]: Math.max(1, (prev[index] || 1) - 1),
                            }))
                          }
                        >
                          -
                        </button>
                        <span className="min-w-[24px] text-center font-semibold">
                          {personnel}
                        </span>
                        <button
                          type="button"
                          className="concurrent-staff-btn w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-lg font-medium"
                          onClick={() =>
                            setPartTimePersonnel((prev) => ({
                              ...prev,
                              [index]: (prev[index] || 1) + 1,
                            }))
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // 파트타임 구간이 없는 경우
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
                <div className="text-left flex-1 min-w-0">
                  <h2 className="text-xl font-bold mb-2 break-keep">
                    동시 근무자 수를 알려주세요!
                  </h2>
                  <p className="text-base font-medium break-keep">저장된 파트 타임 구간이 없어요.</p>
                </div>
                <div className="text-right sm:text-right flex-shrink-0">
                  <button
                    type="button"
                    className="create-schedule-btn w-fit text-sm font-semibold"
                    onClick={() => navigate("/owner/store-settings")}
                  >
                    생성하기
                  </button>
                </div>
              </div>
              <div className="concurrent-staff-container">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <PeopleIcon className="flex-shrink-0" />
                  <span className="concurrent-staff-label break-keep">동시 근무자 수</span>
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
            </>
          )}
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

      {/* 근무표 요청 확인 모달 */}
      {showRequestPopup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => !isLoading && setShowRequestPopup(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-request-modal-title"
        >
          <div
            className="bg-white rounded-2xl w-full sm:max-w-[500px] p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[min(90vh,640px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="schedule-request-modal-title"
                className="text-lg sm:text-xl font-bold text-gray-900 min-w-0 flex-1 break-keep"
              >
                요청 전 내용을 확인해 주세요
              </h2>
              <button
                type="button"
                onClick={() => !isLoading && setShowRequestPopup(false)}
                disabled={isLoading}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium text-gray-700 break-keep">
                근무 기간: {periodText}
              </p>
              {hasPartTimeSegments && partTimeSegments.length > 0 ? (
                <div className="space-y-1">
                  {partTimeSegments.map((segment, index) => {
                    const startTime = (segment.startTime || segment.start || "09:00").slice(0, 5);
                    const endTime = (segment.endTime || segment.end || "18:00").slice(0, 5);
                    const personnel = partTimePersonnel[index] || 1;
                    return (
                      <p key={index} className="text-sm sm:text-base font-medium text-gray-700 break-keep">
                        {getPartTimeLabel(index)} ({startTime}-{endTime}): {personnel}명
                      </p>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm sm:text-base font-medium text-gray-700 break-keep">
                  근무 인원: {totalPersonnel}명
                </p>
              )}
            </div>
            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={() => setShowRequestPopup(false)}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl font-semibold border border-gray-300 text-gray-700 text-base disabled:opacity-60"
              >
                수정하기
              </button>
              <span className="mx-4 text-gray-300 select-none" aria-hidden="true">
                |
              </span>
              <button
                type="button"
                onClick={handleRequestSchedule}
                disabled={isLoading}
                className="px-6 py-3 rounded-xl font-semibold bg-[#3370FF] text-white disabled:opacity-60 text-base"
              >
                {isLoading ? "요청 중..." : "요청하기"}
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
            className="bg-white rounded-2xl w-full sm:max-w-[500px] p-4 sm:p-6 space-y-4 relative"
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
            <div className="space-y-4 pr-6 sm:pr-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">근무표 생성 방법</h3>
              <div className="space-y-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p className="break-keep">
                  <span className="font-semibold">1.</span> 기간 탭을 눌러 근무표를 생성하고자 하는 기간을 설정해주세요.
                </p>
                <p className="break-keep">
                  <span className="font-semibold">2.</span> 인원 탭을 눌러 근무시간대에 배치될 인원을 설정해주세요.
                  <br />
                  만약, 매장 정보에 저장된 파트타임이 있다면 파트타임별 근무인원 배치가 가능해요.
                  <br />
                  저장된 파트타임이 없다면 한시간 간격으로 나누어 근무표 생성이 돼요.
                </p>
                <p className="break-keep">
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
