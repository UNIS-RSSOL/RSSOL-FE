import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import TimeSlotCalendar from "../../../components/common/calendar/TimeSlotCalendar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import Toast from "../../../components/common/Toast.jsx";
import { fetchAllWorkers, fetchEmployeeAvailabilities } from "../../../services/owner/ScheduleService.js";
import { generateSchedule } from "../../../services/scheduleService.js";
import { fetchActiveStore } from "../../../services/owner/MyPageService.js";

function ScheduleList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workers, setWorkers] = useState([]);
  const [workerSchedules, setWorkerSchedules] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // CalAdd에서 전달받은 정보 (시간 구간, 시작일, 종료일 등)
  const scheduleConfig = location.state || {};

  // 매장 ID 가져오기
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

  // 직원 리스트 및 스케줄 가져오기
  useEffect(() => {
    const loadWorkersAndSchedules = async () => {
      try {
        if (!storeId) return; // storeId가 없으면 로드하지 않음
        
        const startOfWeek = dayjs().locale("ko").startOf("week");
        const endOfWeek = startOfWeek.add(6, "day");
        
        // 직원 리스트 가져오기
        // /api/store/staff는 이미 활성 매장의 직원들만 반환하므로 필터링 불필요
        const workersList = await fetchAllWorkers();
        
        // 사장 제외하고 알바생만 필터링
        const storeWorkers = (workersList || []).filter(worker => {
          // role이나 userType으로 사장 필터링
          const isOwner = worker.role === 'OWNER' || 
                         worker.userType === 'OWNER' ||
                         worker.position === 'OWNER';
          return !isOwner;
        });
        
        setWorkers(storeWorkers);

        // 각 직원의 work availability 가져오기
        const schedulesByWorker = {};
        
        // 각 직원의 work availability를 병렬로 가져오기
        const availabilityPromises = storeWorkers.map(async (worker) => {
          const workerId = worker.userId || worker.id || worker.userStoreId;
          if (!workerId) return;
          
          try {
            const availabilities = await fetchEmployeeAvailabilities(workerId);
            if (availabilities && Array.isArray(availabilities)) {
              schedulesByWorker[workerId] = availabilities;
            }
          } catch (error) {
            console.error(`직원 ${workerId}의 근무 가능 시간 조회 실패:`, error);
            schedulesByWorker[workerId] = [];
          }
        });
        
        await Promise.all(availabilityPromises);
        setWorkerSchedules(schedulesByWorker);
      } catch (error) {
        console.error("직원 및 스케줄 로드 실패:", error);
      }
    };
    loadWorkersAndSchedules();
  }, [storeId]);

  // 근무 가능 시간대 포맷팅
  const formatAvailableTimes = (workerId) => {
    const schedules = workerSchedules[workerId] || [];
    if (schedules.length === 0) {
      return "근무 가능 시간 없음";
    }

    // 요일별로 그룹화
    const byDay = {};
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    schedules.forEach((schedule) => {
      const date = dayjs(schedule.startDatetime).locale("ko");
      const dayIndex = date.day();
      const dayName = dayNames[dayIndex];
      const timeRange = `${date.format("HH:mm")}-${dayjs(schedule.endDatetime).format("HH:mm")}`;
      
      if (!byDay[dayName]) {
        byDay[dayName] = [];
      }
      byDay[dayName].push(timeRange);
    });

    // 요일별로 정렬 (일-토)
    const dayOrder = ["일", "월", "화", "수", "목", "금", "토"];
    const formatted = dayOrder
      .filter((day) => byDay[day])
      .map((day) => {
        const times = byDay[day].join(", ");
        return `${day} ${times}`;
      })
      .join(" / ");

    return formatted || "근무 가능 시간 없음";
  };

  // 해당 요일, 시간에 근무 가능한 직원 찾기
  const getAvailableWorkers = (day, hour) => {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dayIndex = dayNames.indexOf(day);
    if (dayIndex === -1) return [];

    const availableWorkers = [];
    workers.forEach((worker) => {
      // worker.userStoreId 또는 worker.id를 사용하여 스케줄 찾기
      const workerId = worker.userStoreId || worker.id;
      const schedules = workerSchedules[workerId] || [];
      const hasSchedule = schedules.some((schedule) => {
        const scheduleDate = dayjs(schedule.startDatetime).locale("ko");
        const scheduleDay = scheduleDate.day();
        const scheduleStartHour = scheduleDate.hour();
        const scheduleEndHour = dayjs(schedule.endDatetime).hour();
        
        return (
          scheduleDay === dayIndex &&
          hour >= scheduleStartHour &&
          hour < scheduleEndHour
        );
      });
      
      if (hasSchedule) {
        availableWorkers.push(worker);
      }
    });

    return availableWorkers;
  };

  // 캘린더 칸 클릭 핸들러
  const handleTimeSlotClick = (day, hour) => {
    setSelectedDay(day);
    setSelectedHour(hour);
    setToastOpen(true);
  };

  // 셀 배경색 진하게 하기 위한 "해당 칸 가능 인원 수" 반환 함수
  const getAvailabilityCount = (day, hour) => {
    return getAvailableWorkers(day, hour).length;
  };

  // 근무표 생성하기
  const handleGenerateSchedule = async () => {
    if (isGenerating) return;
    
    if (!storeId) {
      alert("매장 정보를 불러올 수 없습니다.");
      return;
    }

    try {
      setIsGenerating(true);

      // CalAdd에서 전달받은 정보가 있으면 사용, 없으면 기본값 사용
      const timeSegments = scheduleConfig.timeSegments || [
        { startTime: "09:00:00", endTime: "18:00:00", requiredStaff: 1 }
      ];
      const openTime = scheduleConfig.openTime || "09:00:00";
      const closeTime = scheduleConfig.closeTime || "18:00:00";

      const result = await generateSchedule(
        storeId,
        openTime,
        closeTime,
        timeSegments,
        { candidateCount: 5 }
      );

      if (result && result.candidateScheduleKey) {
        const startDate = scheduleConfig.startDate || dayjs().locale("ko").startOf("week").format("YYYY-MM-DD");
        const endDate = scheduleConfig.endDate || dayjs().locale("ko").startOf("week").add(6, "day").format("YYYY-MM-DD");
        
        navigate("/autoCal", {
          state: {
            candidateKey: result.candidateScheduleKey,
            startDate,
            endDate,
            generatedCount: result.generatedCount ?? 5,
          },
        });
      } else {
        alert("근무표 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("근무표 생성 실패:", error);
      alert("근무표 생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
      <TopBar title="근무표 생성" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-3 flex flex-col gap-4 overflow-y-auto">
        <p className="text-center font-bold text-lg">직원 스케줄 목록</p>
        
        <div className="flex justify-center">
          <TimeSlotCalendar
            onTimeSlotClick={handleTimeSlotClick}
            getAvailabilityCount={getAvailabilityCount}
          />
        </div>

        <div className="w-[90%] mx-auto">
            <div className="flex items-center justify-between">
            <p className="text-base font-medium">전체 직원 가능 근무 시간대</p>
            <button
                onClick={() => navigate("/addOwner")}
                className="font-medium rounded-full flex items-center justify-center"
                style={{
                    width: "100px",
                    height: "25px",
                    fontSize: "14px",
                    backgroundColor: "#68E194",
                    color: "#000000",
                    WebkitAppearance: "none",
                    appearance: "none",
                    border: "none",
                    borderRadius: "20px",
                    outline: "none",
                    padding: "0",
                    margin: "0",
                }}
                >
                내 스케줄 추가
            </button>
            </div>

            <div className="flex flex-col gap-3 mt-3">
            {workers.map((worker) => {
                const workerId = worker.userStoreId || worker.id;
                return (
                <div
                key={worker.id || worker.userStoreId}
                className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                >
                <div className="flex-shrink-0 w-12 h-12 bg-[#68E194] rounded-full border-2 border-white shadow-sm" />
                <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate">
                    {worker.name || worker.userName || "이름 없음"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                    {formatAvailableTimes(workerId)}
                    </p>
                </div>
                </div>
                );
            })}
            {workers.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                등록된 직원이 없습니다.
                </p>
            )}
            </div>
        </div>
      </div>
      
      <BottomBar
        singleButton
        singleButtonText={isGenerating ? "생성 중..." : "생성하기"}
        onSingleClick={handleGenerateSchedule}
      />

      <Toast isOpen={toastOpen} onClose={() => setToastOpen(false)}>
        <p className="text-lg font-bold mb-4">
          {selectedDay && selectedHour !== null
            ? `${selectedDay} ${selectedHour}시 근무 가능 직원`
            : "근무 가능 직원"}
        </p>
        {selectedDay && selectedHour !== null ? (
          (() => {
            const availableWorkers = getAvailableWorkers(selectedDay, selectedHour);
            return availableWorkers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {availableWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#68E194] rounded-full border-2 border-white shadow-sm" />
                    <p className="text-base font-semibold">
                      {worker.name || worker.userName || "이름 없음"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">근무 가능한 직원이 없습니다.</p>
            );
          })()
        ) : (
          <p className="text-gray-500">근무 가능한 직원이 없습니다.</p>
        )}
      </Toast>
    </div>
  );
}

export default ScheduleList;

