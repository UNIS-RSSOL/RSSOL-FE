import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import BottomBar from "../../../components/layout/footer/BottomBar.jsx";
import {
  getActiveStore,
  getOwnerStore,
} from "../../../services/MypageService.js";
import {
  generateSchedule,
  confirmSchedule,
  requestScheduleInput,
} from "../../../services/ScheduleGenerationService.js";
// ✅ 알림 연동: /api/schedules/requests API 호출 시 백엔드에서 매장 내 직원들에게 자동으로 알림이 전송됩니다.
// 별도의 알림 API 호출이 필요하지 않습니다.
import "./AddSchedule.css";

export default function AddSchedule() {
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
          else if (dateStr > start && dateStr < end)
            cell.classList.add("range-between");
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

  const handleDeleteTime = (index) => {
    const newSlots = timeSlots.filter((_, idx) => idx !== index);
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
        const activeStore = await getActiveStore();
        console.log("🏪 CalAdd - 활성 매장 정보:", activeStore);
        // storeId 또는 id 필드 확인
        const id = activeStore?.storeId || activeStore?.id;
        if (id) {
          setStoreId(id);
          console.log("✅ CalAdd - storeId 설정:", id);
        } else {
          console.warn("⚠️ CalAdd - storeId를 찾을 수 없음:", activeStore);
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
          (slot) => slot.start && slot.end && slot.count > 0,
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
          { candidateCount: 5 },
        );

        if (result && result.candidateScheduleKey) {
          // candidate 확정 시 시작일자/마무리일자 포함
          // 생성된 후보들을 선택하는 화면으로 이동
          alert("근무표 후보가 생성되었습니다.");
          navigate("/autoCal", {
            state: {
              candidateKey: result.candidateScheduleKey,
              startDate,
              endDate,
              generatedCount: result.generatedCount ?? 5,
            },
          });
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
      const result = await confirmSchedule(
        candidateKey,
        index,
        startDate,
        endDate,
      );
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
    visibleMonth.month,
  ).padStart(2, "0")}`;

  return (
    <div className="w-full flex flex-col h-screen">
      <TopBar title="근무표 생성" onBack={() => navigate("/owner")} />

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

      {/* 구분선 */}
      <div className="divider-line"></div>

      <div className="flex-1 overflow-auto p-4 space-y-4 schedule-unit-container">
        {/* ---------- 시간 슬롯 ---------- */}
        <div className="space-y-2">
          <div className="font-semibold text-20px">근무표 생성 단위</div>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={unitSpecified}
              onChange={() => setUnitSpecified(true)}
            />
            <span style={{ fontSize: "18px", fontWeight: "600" }}>지정함</span>
          </label>
          {unitSpecified && (
            <div className="space-y-2 time-slots-container">
              {timeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center space-x-2 time-slot-row"
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-gray-200"
                    style={{
                      width: "20px",
                      height: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <input
                    type="time"
                    value={slot.start}
                    className="time-input"
                    onChange={(e) =>
                      handleTimeChange(idx, "start", e.target.value)
                    }
                  />
                  <span>-</span>
                  <input
                    type="time"
                    value={slot.end}
                    className="time-input"
                    onChange={(e) =>
                      handleTimeChange(idx, "end", e.target.value)
                    }
                  />

                  <div className="flex items-center space-x-1">
                    <button
                      className="personnel-btn personnel-btn-minus"
                      onClick={() =>
                        handleTimeChange(
                          idx,
                          "count",
                          Math.max(slot.count - 1, 0),
                        )
                      }
                    >
                      -
                    </button>
                    <span>{slot.count}</span>
                    <span>명</span>
                    <button
                      className="personnel-btn personnel-btn-plus"
                      onClick={() =>
                        handleTimeChange(idx, "count", slot.count + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="personnel-btn personnel-btn-delete"
                    onClick={() => handleDeleteTime(idx)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button onClick={handleAddTime} className="add-time-btn">
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
            <span style={{ fontSize: "18px", fontWeight: "600" }}>
              지정하지 않음
            </span>
          </label>
          {!unitSpecified && (
            <div className="mt-2 space-y-1">
              <div className="font-medium text-18px">
                최소 근무시간
                <input
                  type="number"
                  min="1"
                  value={minWorkTime}
                  className="border p-1 rounded w-12 ml-2 mr-2"
                  onChange={(e) => setMinWorkTime(e.target.value)}
                />
                <span>시간</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomBar
        singleButton
        singleButtonText="근무표 생성 요청하기"
        onSingleClick={async () => {
          try {
            setIsLoading(true);

            // 1. 매장 ID 가져오기 (활성 매장 정보에서)
            // ⚠️ storeId 필수: 백엔드에서 알림 생성 시 storeId가 필요함
            let currentStoreId = storeId; // 먼저 상태에서 가져오기
            console.log("🔍 CalAdd - 초기 storeId 상태:", {
              storeId,
              currentStoreId,
            });

            // 상태에 storeId가 없으면 활성 매장 정보에서 가져오기
            if (!currentStoreId) {
              try {
                const activeStore = await getActiveStore();
                console.log(
                  "🏪 CalAdd - 버튼 클릭 시 활성 매장 정보:",
                  activeStore,
                );
                console.log(
                  "🏪 CalAdd - activeStore 전체 구조:",
                  JSON.stringify(activeStore, null, 2),
                );

                // storeId 또는 id 필드 확인
                const id = activeStore?.storeId || activeStore?.id;
                console.log("🔍 CalAdd - activeStore에서 추출한 id:", id);

                if (id) {
                  currentStoreId = id;
                  setStoreId(id); // 상태에도 저장
                  console.log("✅ CalAdd - 버튼 클릭 시 storeId 설정:", id);
                } else {
                  console.warn(
                    "⚠️ CalAdd - activeStore에 storeId/id 없음, getOwnerStore 시도",
                  );
                  // activeStore에 없으면 getOwnerStore에서 가져오기 (AddOwner.jsx와 동일한 로직)
                  try {
                    const storedata = await getOwnerStore();
                    console.log("🏪 CalAdd - getOwnerStore 응답:", storedata);
                    console.log(
                      "🏪 CalAdd - storedata 전체 구조:",
                      JSON.stringify(storedata, null, 2),
                    );

                    const storeIdFromData = storedata?.storeId || storedata?.id;
                    if (storeIdFromData) {
                      currentStoreId = storeIdFromData;
                      setStoreId(storeIdFromData);
                      console.log(
                        "✅ CalAdd - getOwnerStorefetchStoredata에서 storeId 설정:",
                        storeIdFromData,
                      );
                    } else {
                      console.error(
                        "❌ CalAdd - getOwnerStore에도 storeId 없음:",
                        storedata,
                      );
                    }
                  } catch (storeError) {
                    console.error(
                      "❌ CalAdd - getOwnerStore 실패:",
                      storeError,
                    );
                  }
                }
              } catch (error) {
                console.error("❌ CalAdd - 활성 매장 정보 로드 실패:", error);
              }
            }

            console.log("🔍 CalAdd - 최종 currentStoreId:", currentStoreId);

            if (!currentStoreId) {
              alert("매장 정보를 불러올 수 없습니다. 다시 시도해주세요.");
              setIsLoading(false);
              return;
            }

            // 2. 날짜 범위 확인 (지정함인 경우 필수)
            if (unitSpecified && (!startDate || !endDate)) {
              alert("시작일자와 마무리일자를 모두 선택해주세요.");
              setIsLoading(false);
              return;
            }

            // 3. 지정함인 경우 시간 슬롯 검증
            let timeSegments = null;
            let openTime = "09:00:00";
            let closeTime = "18:00:00";

            if (unitSpecified) {
              const validSlots = timeSlots.filter(
                (slot) => slot.start && slot.end && slot.count > 0,
              );
              if (validSlots.length === 0) {
                alert("최소 하나의 시간 구간을 설정해주세요.");
                setIsLoading(false);
                return;
              }

              timeSegments = validSlots.map((slot) => ({
                startTime: `${slot.start}:00`,
                endTime: `${slot.end}:00`,
                requiredStaff: slot.count,
              }));

              const allTimes = timeSegments.flatMap((seg) => [
                seg.startTime,
                seg.endTime,
              ]);
              const sortedTimes = allTimes.sort();
              openTime = sortedTimes.length > 0 ? sortedTimes[0] : "09:00:00";
              closeTime =
                sortedTimes.length > 0
                  ? sortedTimes[sortedTimes.length - 1]
                  : "18:00:00";
            }

            // 4. /api/schedules/requests API 호출 (요청보내기 & 셋팅저장)
            // ⚠️ currentStoreId 최종 확인 및 검증
            console.log("🔍 CalAdd - currentStoreId 최종 확인:", {
              currentStoreId,
              type: typeof currentStoreId,
              storeIdState: storeId,
              isNull: currentStoreId === null,
              isUndefined: currentStoreId === undefined,
              isFalsy: !currentStoreId,
            });

            // ⚠️ storeId 필수 검증 - 없으면 즉시 종료
            if (
              !currentStoreId ||
              currentStoreId === null ||
              currentStoreId === undefined
            ) {
              console.error("❌ CalAdd - currentStoreId가 없습니다!", {
                currentStoreId,
                storeIdState: storeId,
                activeStoreCheck: "getActiveStore() 호출 필요",
              });
              alert("매장 정보를 불러올 수 없습니다. 다시 시도해주세요.");
              setIsLoading(false);
              return;
            }

            // ⚠️ storeId를 숫자로 변환 (백엔드가 숫자 타입을 기대할 수 있음)
            const storeIdToSend = Number(currentStoreId);
            if (isNaN(storeIdToSend)) {
              console.error(
                "❌ CalAdd - currentStoreId가 유효한 숫자가 아닙니다!",
                {
                  currentStoreId,
                  storeIdToSend,
                },
              );
              alert("매장 정보가 올바르지 않습니다. 다시 시도해주세요.");
              setIsLoading(false);
              return;
            }

            console.log("✅ CalAdd - storeId 검증 통과:", {
              original: currentStoreId,
              converted: storeIdToSend,
            });

            // 백엔드 스펙에 맞게 요청 데이터 구성
            // ⚠️ storeId는 반드시 숫자 값으로 포함
            const requestData = {
              storeId: storeIdToSend, // ⚠️ 필수: 알림 생성 시 필요 (숫자 타입)
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

            // ⚠️ requestData 생성 직후 storeId 확인
            console.log("📦 CalAdd - requestData 생성 직후:", {
              hasStoreId: !!requestData.storeId,
              storeId: requestData.storeId,
              storeIdToSend,
              requestDataKeys: Object.keys(requestData),
            });

            // timeSegments 변환 (startTime, endTime을 "HH:mm:ss" 형식으로)
            if (unitSpecified && timeSegments && timeSegments.length > 0) {
              requestData.timeSegments = timeSegments.map((seg) => ({
                startTime: seg.startTime, // 이미 "HH:mm:ss" 형식
                endTime: seg.endTime, // 이미 "HH:mm:ss" 형식
                requiredStaff: seg.requiredStaff,
              }));
            }

            // ⚠️ timeSegments 추가 후 storeId 재확인
            console.log("📦 CalAdd - timeSegments 추가 후:", {
              hasStoreId: !!requestData.storeId,
              storeId: requestData.storeId,
              requestDataKeys: Object.keys(requestData),
            });

            console.log("📤 CalAdd - requestData 생성 완료:", {
              hasStoreId: !!requestData.storeId,
              storeId: requestData.storeId,
              currentStoreId,
              storeIdToSend,
              requestDataKeys: Object.keys(requestData),
            });
            console.log(
              "📤 CalAdd - 전체 요청 데이터 (JSON):",
              JSON.stringify(requestData, null, 2),
            );
            console.log("📤 CalAdd - 전체 요청 데이터 (객체):", requestData);

            // ⚠️ 최종 검증: storeId가 없으면 에러
            if (
              !requestData.storeId ||
              requestData.storeId === undefined ||
              requestData.storeId === null
            ) {
              console.error("❌ CalAdd - requestData에 storeId가 없습니다!", {
                requestData,
                requestDataStoreId: requestData.storeId,
                currentStoreId,
                storeIdToSend,
                storeIdState: storeId,
                requestDataStringified: JSON.stringify(requestData),
                requestDataKeys: Object.keys(requestData),
              });
              alert("매장 정보를 불러올 수 없습니다. 다시 시도해주세요.");
              setIsLoading(false);
              return;
            }

            console.log("🚀 CalAdd - requestScheduleInput 호출 전 최종 확인:", {
              requestDataStoreId: requestData.storeId,
              storeIdToSend,
              currentStoreId,
              requestDataFull: requestData,
              requestDataStringified: JSON.stringify(requestData),
            });

            // ⚠️ 최종 안전장치: requestData를 새로 만들어서 storeId 확실히 포함
            const finalRequestData = {
              storeId: storeIdToSend, // 명시적으로 다시 설정
              openTime: requestData.openTime,
              closeTime: requestData.closeTime,
              startDate: requestData.startDate,
              endDate: requestData.endDate,
            };
            if (requestData.timeSegments) {
              finalRequestData.timeSegments = requestData.timeSegments;
            }

            console.log(
              "🚀 CalAdd - finalRequestData (최종 전송 데이터):",
              JSON.stringify(finalRequestData, null, 2),
            );

            const result = await requestScheduleInput(
              finalRequestData.openTime,
              finalRequestData.closeTime,
              finalRequestData.startDate,
              finalRequestData.endDate,
              finalRequestData.timeSegments,
            );

            // API 응답에서 scheduleSettingId 또는 settingId 확인
            // API 스펙: { "scheduleSettingId": 0, "status": "string" }
            const settingId = result?.scheduleSettingId || result?.settingId;

            if (result && settingId) {
              // ScheduleList로 이동할 때 플래그 설정
              // (생성하기를 누르지 않고 나가면 다음에 caladdicon 클릭 시 ScheduleList로 이동)
              // ⚠️ 알림: 백엔드에서 /api/schedules/requests 호출 시 매장 내 직원들에게 자동으로 알림이 전송됩니다.
              localStorage.setItem("hasScheduleRequest", "true");
              localStorage.removeItem("scheduleGenerationCompleted"); // 이전 플래그 제거

              // settingId와 설정 정보를 localStorage에 저장 (새로고침 대비)
              const scheduleConfigData = {
                settingId: settingId,
                timeSegments,
                openTime,
                closeTime,
                minWorkTime: !unitSpecified ? minWorkTime : null,
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
              localStorage.setItem(
                "scheduleConfig",
                JSON.stringify(scheduleConfigData),
              );

              console.log(
                "📝 CalAdd → ScheduleList 이동: hasScheduleRequest 설정, scheduleConfig 저장",
              );

              // 5. ScheduleList로 이동하면서 설정 ID 전달
              navigate("/scheduleList", {
                state: scheduleConfigData,
              });
            } else {
              alert("근무표 생성 요청에 실패했습니다.");
            }
          } catch (error) {
            console.error("근무표 생성 요청 실패:", error);
            alert("근무표 생성 요청에 실패했습니다. 다시 시도해주세요.");
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
}
