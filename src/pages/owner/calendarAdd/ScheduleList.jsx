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
            userId: workersList[0].userId,
            id: workersList[0].id,
            userStoreId: workersList[0].userStoreId,
            staffId: workersList[0].staffId,
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

        // 각 직원의 work availability 가져오기
        // 사장용 API: GET /api/store/staff/{staffId}/availabilities 사용
        const schedulesByWorker = {};
        const errorsByWorker = {};
        
        // 각 직원의 work availability를 병렬로 가져오기
        const availabilityPromises = storeWorkers.map(async (worker) => {
          // 사장용 API는 userStoreId를 staffId로 사용하여 특정 직원의 근무 가능 시간을 조회합니다
          const staffId = worker.userStoreId;
          const workerName = worker.username || worker.name || '이름없음';
          
          if (!staffId) {
            const errorMsg = "직원 ID를 찾을 수 없습니다";
            console.error(`❌ ${workerName}:`, errorMsg, {
              worker,
              availableFields: Object.keys(worker),
            });
            errorsByWorker[staffId] = {
              staffId,
              workerName,
              error: new Error(errorMsg),
              status: null,
            };
            return;
          }
          
          console.log(`🔍 직원 ${workerName} (ID: ${staffId})의 근무 가능 시간 조회 시작`, {
            worker: {
              userStoreId: worker.userStoreId,
              username: worker.username,
              allFields: Object.keys(worker),
            },
            staffId,
            staffIdType: typeof staffId,
          });
          
          try {
            const availabilities = await fetchEmployeeAvailabilities(staffId);
            
            if (availabilities && Array.isArray(availabilities)) {
              schedulesByWorker[staffId] = availabilities;
              console.log(`✅ 직원 ${workerName} (ID: ${staffId}) 근무 가능 시간: ${availabilities.length}개`);
            } else {
              schedulesByWorker[staffId] = [];
              console.log(`⚠️ 직원 ${workerName} (ID: ${staffId})의 근무 가능 시간이 배열이 아닙니다:`, availabilities);
            }
          } catch (error) {
            // ❗ 실패를 명시적으로 기록
            const errorInfo = {
              staffId,
              workerName,
              error,
              status: error.response?.status || null,
              statusText: error.response?.statusText || null,
              errorData: error.response?.data || null,
              errorMessage: error.message,
            };
            
            console.error(`❌ 직원 ${workerName} (ID: ${staffId}) 근무 가능시간 조회 실패:`, errorInfo);
            
            // 실패한 직원은 빈 배열로 설정하되, 에러 정보도 저장
            schedulesByWorker[staffId] = [];
            errorsByWorker[staffId] = errorInfo;
            
            // 500 에러인 경우 추가 경고
            if (error.response?.status === 500) {
              console.error(`⚠️ [서버 500 오류] 직원 ${workerName} (ID: ${staffId})의 데이터를 서버에서 불러올 수 없습니다.`, {
                staffId,
                staffIdType: typeof staffId,
                workerName,
                requestURL: error.config?.url,
                requestMethod: error.config?.method,
                requestHeaders: {
                  ...error.config?.headers,
                  Authorization: error.config?.headers?.Authorization 
                    ? `Bearer ${error.config.headers.Authorization.split(' ')[1]?.substring(0, 20)}...` 
                    : '❌ 없음',
                },
                responseStatus: error.response?.status,
                responseData: error.response?.data,
                responseHeaders: error.response?.headers,
                errorMessage: error.response?.data?.message || error.response?.data?.error || error.message,
                // 백엔드 개발자용 요약
                backendSummary: {
                  endpoint: `/api/store/staff/${staffId}/availabilities`,
                  method: "GET",
                  status: 500,
                  staffId: staffId,
                  staffIdType: typeof staffId,
                  errorMessage: error.response?.data?.message || error.response?.data?.error || "서버 내부 오류",
                  fullErrorData: error.response?.data,
                },
              });
            }
          }
        });
        
        await Promise.all(availabilityPromises);
        
        const successCount = Object.keys(schedulesByWorker).length - Object.keys(errorsByWorker).length;
        const errorCount = Object.keys(errorsByWorker).length;
        
        console.log("📊 모든 직원의 스케줄 로드 완료:", {
          totalWorkers: storeWorkers.length,
          successCount,
          errorCount,
          schedulesCount: Object.keys(schedulesByWorker).length,
        });
        
        if (errorCount > 0) {
          console.warn(`⚠️ ${errorCount}명의 직원 데이터 로드 실패:`, errorsByWorker);
          
          // 저장/조회 API 키 불일치 진단 정보
          console.error("🔍 [진단] 저장/조회 API 키 불일치 가능성 체크:", {
            message: "저장 API와 조회 API가 다른 키를 사용할 수 있습니다.",
            저장API: {
              endpoint: "POST /api/me/availabilities",
              사용키: "userStoreId",
              설명: "알바생이 자신의 근무 가능 시간을 저장할 때 사용",
            },
            조회API: {
              endpoint: "GET /api/store/staff/{staffId}/availabilities",
              사용키: "staffId (userStoreId와 동일해야 함)",
              설명: "사장이 직원의 근무 가능 시간을 조회할 때 사용",
            },
            실패한직원들: Object.keys(errorsByWorker).map(staffId => {
              const error = errorsByWorker[staffId];
              return {
                staffId,
                workerName: error.workerName,
                errorStatus: error.status,
                errorMessage: error.errorMessage,
              };
            }),
            확인방법: [
              "1. 저장 시 사용한 userStoreId와 조회 시 사용한 staffId가 일치하는지 확인",
              "2. Postman으로 GET /api/store/staff/{staffId}/availabilities 직접 호출",
              "3. 백엔드 로그에서 저장 시 사용된 키와 조회 시 사용된 키 확인",
            ],
          });
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
    // worker 객체에서 userStoreId 추출 (staffId로 사용)
    const staffId = worker?.userStoreId;
    const schedules = workerSchedules[staffId] || [];
    const error = workerErrors[staffId];
    
    // 에러가 있는 경우 에러 메시지 반환
    if (error) {
      if (error.status === 500) {
        return "⚠️ 서버 오류로 데이터를 불러올 수 없습니다";
      } else if (error.status === 404) {
        return "⚠️ 데이터를 찾을 수 없습니다";
      } else {
        return "⚠️ 데이터 로드 실패";
      }
    }
    
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
      // worker.userStoreId를 staffId로 사용하여 스케줄 찾기
      const staffId = worker.userStoreId;
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
                const workerId = worker.userStoreId;
                const hasError = workerErrors[workerId];
                const errorStatus = hasError?.status;
                
                return (
                <div
                key={worker.userStoreId}
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

