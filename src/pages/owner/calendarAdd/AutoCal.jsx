import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import AutoCalCalendar from "../../../components/common/calendar/AutoCalCalendar.jsx";
import Modal from "../../../components/common/Modal.jsx";
import WhiteBtn from "../../../components/common/WhiteBtn.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import { confirmSchedule, fetchCandidateSchedule } from "../../../services/scheduleService.js";

dayjs.locale("ko");

/**
 * 근무표 자동 생성 결과(후보들)를 선택하는 화면
 * - CalAdd에서 근무표 생성 후 넘어옴
 * - 번호 버튼으로 후보 인덱스를 선택하고, 선택한 후보를 확정
 */
export default function AutoCal() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    candidateKey,
    startDate,
    endDate,
    generatedCount = 5,
  } = location.state || {};

  // 기본값 설정 (state가 없어도 동작하도록)
  const defaultStartDate = startDate || dayjs().format("YYYY-MM-DD");
  const defaultEndDate = endDate || dayjs().add(6, "day").format("YYYY-MM-DD");

  const [selectedIndex, setSelectedIndex] = useState(null); // 초기값 null (아무것도 선택 안 함)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateSchedules, setCandidateSchedules] = useState({}); // 각 대안별 스케줄 데이터

  const candidates = Array.from(
    { length: Math.max(generatedCount, 1) },
    (_, idx) => idx,
  );

  // 각 대안별 스케줄 데이터 가져오기
  useEffect(() => {
    if (!candidateKey) return;

    const loadCandidateSchedules = async () => {
      const schedules = {};
      for (let i = 0; i < candidates.length; i++) {
        try {
          const data = await fetchCandidateSchedule(candidateKey, i);
          
          // 백엔드 응답 형식 변환
          // 응답: [{ storeId: 1, shifts: [{ userStoreId, username, startTime, endTime, day }] }]
          // 변환: [{ userStoreId, username, startDatetime, endDatetime }]
          let convertedData = [];
          
          if (Array.isArray(data) && data.length > 0) {
            // 첫 번째 store의 shifts 사용 (보통 하나의 store만 있음)
            const storeData = data[0];
            if (storeData && storeData.shifts && Array.isArray(storeData.shifts)) {
              // 주의 시작일 계산 (일요일 기준)
              const startOfWeek = dayjs(defaultStartDate).locale("ko").startOf("week");
              const dayMap = { 
                "SUN": 0, "MON": 1, "TUE": 2, "WED": 3, 
                "THU": 4, "FRI": 5, "SAT": 6 
              };
              
              convertedData = storeData.shifts.map((shift) => {
                const dayIndex = dayMap[shift.day?.toUpperCase()] ?? 0;
                const targetDate = startOfWeek.add(dayIndex, "day");
                
                // startTime, endTime을 파싱 (예: "09:00:00")
                const [startHour, startMinute, startSecond = 0] = 
                  (shift.startTime || "00:00:00").split(":").map(Number);
                const [endHour, endMinute, endSecond = 0] = 
                  (shift.endTime || "00:00:00").split(":").map(Number);
                
                // ISO string 형식으로 변환
                const startDatetime = targetDate
                  .hour(startHour || 0)
                  .minute(startMinute || 0)
                  .second(startSecond || 0)
                  .toISOString();
                
                const endDatetime = targetDate
                  .hour(endHour || 0)
                  .minute(endMinute || 0)
                  .second(endSecond || 0)
                  .toISOString();
                
                return {
                  id: Math.random(), // 고유 ID 생성
                  userStoreId: shift.userStoreId,
                  username: shift.username,
                  startDatetime,
                  endDatetime,
                  // 원본 데이터도 보존 (필요시)
                  startTime: shift.startTime,
                  endTime: shift.endTime,
                  day: shift.day,
                };
              });
            }
          }
          
          schedules[i] = convertedData;
        } catch (error) {
          console.error(`대안 ${i + 1} 스케줄 로드 실패:`, error);
          schedules[i] = [];
        }
      }
      setCandidateSchedules(schedules);
    };

    loadCandidateSchedules();
  }, [candidateKey, generatedCount, defaultStartDate]);

  // 스케줄 데이터를 기반으로 미리보기 그리드 생성
  const generatePreviewGrid = (scheduleData) => {
    if (!scheduleData || scheduleData.length === 0) {
      return Array.from({ length: 14 }, () => false);
    }

    // 주간 그리드 (7일 x 2행 = 14칸)
    const grid = Array.from({ length: 14 }, () => false);
    
    // 각 스케줄을 그리드에 매핑
    scheduleData.forEach((schedule) => {
      // startDatetime이 있으면 사용, 없으면 day로 변환
      let dayOfWeek = 0;
      
      if (schedule.startDatetime) {
        const startDate = dayjs(schedule.startDatetime);
        dayOfWeek = startDate.day(); // 0(일) ~ 6(토)
      } else if (schedule.day) {
        // day 필드가 있으면 직접 변환 (MON, TUE 등)
        const dayMap = { 
          "SUN": 0, "MON": 1, "TUE": 2, "WED": 3, 
          "THU": 4, "FRI": 5, "SAT": 6 
        };
        dayOfWeek = dayMap[schedule.day.toUpperCase()] ?? 0;
      }
      
      // 해당 요일에 스케줄이 있다고 표시
      if (dayOfWeek < 7) {
        grid[dayOfWeek] = true;
        if (dayOfWeek + 7 < 14) {
          grid[dayOfWeek + 7] = true;
        }
      }
    });

    return grid;
  };

  // 선택된 대안의 시작 날짜를 WeekCalendar에 전달 (주간 캘린더 기준)
  const calendarDate = dayjs(defaultStartDate).locale("ko");

  const handleSave = async () => {
    if (selectedIndex === null) {
      alert("대안을 선택해주세요.");
      return;
    }

    if (!candidateKey) {
      alert("근무표 후보 정보가 없습니다. 먼저 근무표를 생성해주세요.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // API 요청 데이터 확인
      const requestData = {
        candidateKey,
        index: selectedIndex,
        startDate: defaultStartDate,
        endDate: defaultEndDate,
      };

      console.log("📤 근무표 확정 요청:", requestData);

      const result = await confirmSchedule(
        candidateKey,
        selectedIndex,
        defaultStartDate,
        defaultEndDate,
      );

      console.log("✅ 근무표 확정 응답:", result);

      // 응답이 성공인지 확인 (다양한 응답 형식 지원)
      const isSuccess = result && (
        result.status === "success" || 
        result.status === 200 || 
        result.message || 
        result.scheduleId !== undefined
      );

      if (isSuccess) {
        console.log("✅ 근무표 확정 성공 - 모달 표시");
        setIsModalOpen(true);
      } else {
        console.error("❌ 근무표 확정 실패 - 응답 형식 확인 필요:", result);
        alert("근무표 확정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("근무표 확정 실패:", {
        error: error.response?.data || error.message,
        status: error.response?.status,
        requestData: {
          candidateKey,
          index: selectedIndex,
          startDate: defaultStartDate,
          endDate: defaultEndDate,
        },
      });
      alert("근무표 확정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalButton = async (action) => {
    setIsModalOpen(false);
    
    // 백엔드가 데이터를 저장하는 데 시간이 걸릴 수 있으므로 약간의 지연 추가
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (action === "view") {
      // 근무표 확정 후 캘린더로 이동 시 새로고침 플래그 전달
      navigate("/owner/calendar", { 
        state: { refresh: true, confirmedSchedule: true } 
      });
    } else if (action === "edit") {
      navigate("/owner/calendar", { 
        state: { refresh: true, confirmedSchedule: true } 
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FBFE] flex flex-col">
      <TopBar title="근무표 대안 선택" onBack={() => navigate(-1)} />

      {/* 상단바를 고정하고, 나머지 영역만 스크롤 되도록 처리 */}
      <div className="flex-1 flex flex-col px-4 py-4 gap-4 overflow-y-auto scrollbar-hide">
        {/* 제목과 소제목 */}
        <div className="flex flex-col gap-1">
          <div className="text-[16px] font-semibold">자동 스케줄 생성</div>
          <div className="text-[14px] text-[#666]">
            근무표가 생성되었어요. 마음에 드는 근무표를 저장하세요
          </div>
        </div>

        {/* 대안 번호 버튼들 (수평 나열) */}
        <div className="flex flex-row gap-2 overflow-x-scroll scrollbar-hide">
          {candidates.map((idx) => {
            const isActive = idx === selectedIndex;
            const scheduleData = candidateSchedules[idx] || [];
            const previewGrid = generatePreviewGrid(scheduleData);
            
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                style={{ backgroundColor: 'white', WebkitAppearance: 'none', appearance: 'none' }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg border border-black flex items-center justify-center overflow-hidden ${
                  isActive
                    ? "border-[#32D1AA] border-2"
                    : ""
                }`}
              >
                {/* 숫자 - 왼쪽 상단 */}
                <span className={`absolute top-0.5 left-0.5 text-[10px] font-semibold z-10 ${
                  isActive ? "text-[#32D1AA]" : "text-[#666]"
                }`}>
                  {idx + 1}
                </span>
                
                {/* 작은 캘린더 미리보기 - 배경 꽉차게 */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full bg-[#F8FBFE] flex flex-col">
                    {/* 간단한 캘린더 그리드 미리보기 */}
                    <div className="flex-1 grid grid-cols-7 gap-px p-0.5">
                      {previewGrid.map((hasSchedule, i) => (
                        <div
                          key={i}
                          className={`${
                            hasSchedule
                              ? "bg-[#32D1AA] opacity-40"
                              : "bg-transparent"
                          } rounded-sm`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* AutoCal 전용 캘린더 */}
        <div className="flex justify-center mt-2">
          <AutoCalCalendar
            hasSelection={selectedIndex !== null}
            schedules={selectedIndex !== null ? candidateSchedules[selectedIndex] : []}
          />
        </div>
      </div>

      <BottomBar
        singleButton
        singleButtonText={isSubmitting ? "저장 중..." : "근무표 저장하기"}
        onSingleClick={handleSave}
      />

      {/* 완료 모달 */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-[16px] font-[400]">
                근무표 생성이 완료되었어요!
              </p>
            </div>
            <div className="flex flex-row w-full gap-2">
              <WhiteBtn
                className="flex-1 h-[35px] text-[14px] font-[500]"
                onClick={() => handleModalButton("edit")}
              >
                근무표 수정하기
              </WhiteBtn>
              <GreenBtn
                className="flex-1 h-[35px] text-[14px] font-[500]"
                onClick={() => handleModalButton("view")}
              >
                근무표 보러가기
              </GreenBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


