import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import TimeSlotCalendar from "../../../components/common/calendar/TimeSlotCalendar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import Toast from "../../../components/common/Toast.jsx";
import { fetchAllWorkers, fetchStoreAvailabilities } from "../../../services/owner/ScheduleService.js";
import { generateScheduleWithSetting } from "../../../services/scheduleService.js";
import { fetchActiveStore, fetchMydata } from "../../../services/owner/MyPageService.js";

function ScheduleList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workers, setWorkers] = useState([]);
  const [workerSchedules, setWorkerSchedules] = useState({});
  const [workerErrors, setWorkerErrors] = useState({}); // 실패한 직원 추적: { staffId: errorInfo }
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // CalAdd에서 전달받은 정보 (settingId, 시간 구간, 시작일, 종료일 등)
  const scheduleConfig = location.state || {};
  const settingId = scheduleConfig.settingId;

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
        if (!storeId) {
          console.log("⏳ storeId 대기 중...");
          return; // storeId가 없으면 로드하지 않음
        }
        
        console.log("🔍 직원 리스트 및 스케줄 로드 시작:", { storeId });
        
        // 직원 리스트 가져오기
        // /api/store/staff는 이미 활성 매장의 직원들만 반환
        const workersList = await fetchAllWorkers();
        
        // 디버깅: 직원 리스트 구조 확인
        console.log("📋 [직원 리스트 원본]:", workersList);
        if (workersList && workersList.length > 0) {
          console.log("📋 [첫 번째 직원 구조 예시]:", {
            worker: workersList[0],
            availableFields: Object.keys(workersList[0]),
            id: workersList[0].id,
            staffId: workersList[0].staffId,
            userStoreId: workersList[0].userStoreId,
            userId: workersList[0].userId,
            // API 엔드포인트에 사용할 ID 확인: GET /api/store/staff/{staffId}/availabilities
            사용할ID: workersList[0].id || workersList[0].staffId,
          });
        }
        
        // 현재 로그인한 사용자의 userStoreId 가져오기
        // fetchActiveStore에서 userStoreId를 가져오거나, fetchMydata에서 가져오기
        let currentUserStoreId = null;
        const activeStore = await fetchActiveStore();
        if (activeStore?.userStoreId) {
          currentUserStoreId = activeStore.userStoreId;
        } else if (activeStore?.id) {
          currentUserStoreId = activeStore.id;
        } else {
          // fetchMydata에서 userStoreId 가져오기 시도
          const mydata = await fetchMydata();
          if (mydata?.userStoreId) {
            currentUserStoreId = mydata.userStoreId;
          } else if (mydata?.id) {
            currentUserStoreId = mydata.id;
          }
        }
        
        // 사장(현재 사용자) 제외하고 알바생만 필터링
        const storeWorkers = (workersList || []).filter(worker => {
          // 현재 사용자의 userStoreId와 일치하면 사장이므로 제외
          const workerStoreId = worker.userStoreId;
          return workerStoreId && workerStoreId !== currentUserStoreId;
        });
        
        console.log(`✅ 필터링된 직원 수: ${storeWorkers.length}명`);
        setWorkers(storeWorkers);

        // 매장의 모든 직원 work availability 가져오기
        // 새로운 API: GET /api/{storeId}/availabilities 사용
        const schedulesByWorker = {};
        const errorsByWorker = {};
        
        try {
          // ✅ 새로운 API: 한 번의 호출로 모든 직원의 availabilities 가져오기
          // 제출안한 직원들은 빈배열 반환
          const storeAvailabilities = await fetchStoreAvailabilities(storeId);
          
          // 응답 형태: 배열 [ { userName: string, availabilities: Array } ]
          // 각 직원별로 availabilities가 빈 배열일 수 있음
          
          storeWorkers.forEach((worker) => {
            const staffId = worker.id || worker.staffId;
            const workerName = worker.username || worker.name || worker.userName || '이름없음';
            
            if (!staffId) {
              const errorMsg = "직원 ID를 찾을 수 없습니다 (id 또는 staffId 필요)";
              console.error(`❌ ${workerName}:`, errorMsg);
              errorsByWorker[staffId || 'unknown'] = {
                staffId: staffId || null,
                workerName,
                error: new Error(errorMsg),
                status: null,
              };
              schedulesByWorker[staffId || 'unknown'] = [];
              return;
            }
            
            // userName으로 매칭하여 해당 직원의 availabilities 가져오기 (없으면 빈 배열)
            const workerAvailability = storeAvailabilities.find(item => item.userName === workerName);
            const availabilities = workerAvailability?.availabilities || [];
            
            if (Array.isArray(availabilities)) {
              schedulesByWorker[staffId] = availabilities;
              if (availabilities.length > 0) {
                console.log(`✅ 직원 ${workerName} (ID: ${staffId}) 근무 가능 시간: ${availabilities.length}개`);
              } else {
                console.log(`ℹ️ 직원 ${workerName} (ID: ${staffId}) 근무 가능 시간 없음 (빈 배열)`);
              }
            } else {
              console.warn(`⚠️ 직원 ${workerName} (ID: ${staffId})의 응답이 배열이 아닙니다:`, availabilities);
              schedulesByWorker[staffId] = [];
            }
          });
        } catch (error) {
          // 전체 조회 실패 시 모든 직원에 대해 에러 처리
          const errorInfo = {
            error,
            status: error.response?.status || null,
            statusText: error.response?.statusText || null,
            errorData: error.response?.data || null,
            errorMessage: error.message,
          };
          
          console.error(`❌ 매장 근무 가능 시간 조회 실패:`, errorInfo);
          
          storeWorkers.forEach((worker) => {
            const staffId = worker.id || worker.staffId;
            const workerName = worker.username || worker.name || '이름없음';
            schedulesByWorker[staffId] = [];
            errorsByWorker[staffId] = {
              staffId,
              workerName,
              ...errorInfo,
            };
          });
        }
        
        const successCount = Object.keys(schedulesByWorker).filter(
          (staffId) => !errorsByWorker[staffId] && schedulesByWorker[staffId]?.length > 0
        ).length;
        const errorCount = Object.keys(errorsByWorker).length;
        const emptyCount = Object.keys(schedulesByWorker).filter(
          (staffId) => !errorsByWorker[staffId] && (!schedulesByWorker[staffId] || schedulesByWorker[staffId].length === 0)
        ).length;
        
        console.log("📊 모든 직원의 스케줄 로드 완료:", {
          totalWorkers: storeWorkers.length,
          successCount,
          emptyCount,
          errorCount,
          schedulesCount: Object.keys(schedulesByWorker).length,
        });
        
        if (errorCount > 0) {
          console.warn(`⚠️ ${errorCount}명의 직원 데이터 로드 실패:`, errorsByWorker);
        }
        
        if (emptyCount > 0) {
          console.log(`ℹ️ ${emptyCount}명의 직원은 근무 가능 시간이 없습니다 (제출 안 함)`);
        }
        
        setWorkerSchedules(schedulesByWorker);
        setWorkerErrors(errorsByWorker);
      } catch (error) {
        console.error("❌ 직원 및 스케줄 로드 실패:", error);
      }
    };
    loadWorkersAndSchedules();
  }, [storeId]);

  // 근무 가능 시간대 포맷팅
  const formatAvailableTimes = (worker) => {
    // id > staffId 순서로 확인 (userStoreId 제외)
    const staffId = worker?.id || worker?.staffId;
    const schedules = workerSchedules[staffId] || [];
    const error = workerErrors[staffId];
    
    // 에러가 있는 경우 사용자 친화적인 메시지 반환
    if (error) {
      if (error.status === 500) {
        // 500 에러는 이미 ScheduleService에서 빈 배열로 처리했지만,
        // 에러 정보가 남아있는 경우에만 표시
        return "⚠️ 근무 가능 시간 데이터 없음 (서버 오류)";
      } else if (error.status === 404) {
        return "⚠️ 근무 가능 시간 데이터 없음";
      } else if (error.status === 401 || error.status === 403) {
        return "⚠️ 권한 오류";
      } else {
        return "⚠️ 데이터 로드 실패";
      }
    }
    
    // 정상적으로 빈 배열인 경우
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
      // id > staffId 순서로 확인 (userStoreId 제외)
      const staffId = worker.id || worker.staffId;
      const schedules = workerSchedules[staffId] || [];
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
    
    if (!settingId) {
      alert("설정 정보를 불러올 수 없습니다. 먼저 근무표 생성 요청을 해주세요.");
      return;
    }

    try {
      setIsGenerating(true);

      // /api/schedules/{settingId}/generate API 호출
      const result = await generateScheduleWithSetting(settingId);

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
                const workerId = worker.id || worker.staffId;
                const hasError = workerErrors[workerId];
                const errorStatus = hasError?.status;
                
                return (
                <div
                key={workerId || worker.id}
                className={`flex items-center gap-3 p-3 rounded-lg shadow-sm ${
                  hasError 
                    ? "bg-red-50 border border-red-200" 
                    : "bg-white"
                }`}
                >
                <div 
                  className={`flex-shrink-0 w-12 h-12 rounded-full border-2 border-white shadow-sm ${
                    hasError 
                      ? "bg-red-300" 
                      : "bg-[#68E194]"
                  }`} 
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold truncate">
                        {worker.username || worker.name || worker.userName || "이름 없음"}
                      </p>
                      {hasError && (
                        <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                          ⚠️ 오류
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      hasError 
                        ? "text-red-600 font-medium" 
                        : "text-gray-600"
                    }`}>
                      {formatAvailableTimes(worker)}
                    </p>
                    {hasError && errorStatus === 500 && (
                      <p className="text-xs text-red-500 mt-1">
                        서버 오류 (500) - 백엔드 개발자에게 문의 필요
                      </p>
                    )}
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
                      {worker.username || worker.name || worker.userName || "이름 없음"}
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

