import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import TimeSlotCalendar from "../../../components/calendar/TimeSlotCalendar.jsx";
import BottomBar from "../../../components/layout/footer/BottomBar.jsx";
import Toast from "../../../components/common/Toast.jsx";
import { getAllWorker } from "../../../services/StoreService.js";
import { getStaffWorkAvailability } from "../../../services/WorkAvailabilityService.js";
import {
  generateScheduleByTime,
  getSubmissionStatus,
} from "../../../services/ScheduleGenerationService.js";
import {
  getActiveStore,
  getOwnerProfile,
} from "../../../services/MypageService.js";

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
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // CalAdd에서 전달받은 정보 (scheduleRequestId, 시간 구간, 시작일, 종료일 등)
  // location.state가 없으면 localStorage에서 가져오기 (새로고침 대비)
  const [scheduleConfig, setScheduleConfig] = useState(() => {
    const stateConfig = location.state || {};
    if (stateConfig.scheduleRequestId) {
      return stateConfig;
    }
    // location.state에 없으면 localStorage에서 가져오기
    const savedConfig = localStorage.getItem("scheduleConfig");
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error("scheduleConfig 파싱 실패:", e);
        return {};
      }
    }
    return {};
  });
  const scheduleRequestId = scheduleConfig.scheduleRequestId;

  // location.state 변경 시 scheduleConfig 업데이트
  useEffect(() => {
    // location.state에 scheduleRequestId가 있으면 그것을 사용
    if (location.state?.scheduleRequestId) {
      setScheduleConfig(location.state);
      // localStorage에도 저장 (일관성 유지)
      localStorage.setItem("scheduleConfig", JSON.stringify(location.state));
    }
  }, [location.state]);

  // 컴포넌트 마운트 시 또는 scheduleRequestId가 없을 때 localStorage에서 다시 확인
  useEffect(() => {
    // location.state가 없고, 현재 scheduleConfig에 scheduleRequestId가 없으면 localStorage에서 확인
    if (!location.state?.scheduleRequestId && !scheduleConfig.scheduleRequestId) {
      const savedConfig = localStorage.getItem("scheduleConfig");
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          if (parsedConfig.scheduleRequestId) {
            console.log(
              "📝 ScheduleList: localStorage에서 scheduleConfig 로드:",
              parsedConfig.scheduleRequestId,
            );
            setScheduleConfig(parsedConfig);
          }
        } catch (e) {
          console.error("scheduleConfig 파싱 실패:", e);
        }
      }
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 매장 ID 가져오기
  useEffect(() => {
    const loadStoreId = async () => {
      try {
        const activeStore = await getActiveStore();
        if (activeStore && activeStore.storeId) {
          setStoreId(activeStore.storeId);
        }
      } catch (error) {
        console.error("매장 ID 로드 실패:", error);
      }
    };
    loadStoreId();
  }, []);

  // ScheduleList 페이지 진입 시: hasScheduleRequest 플래그 확인 및 설정
  useEffect(() => {
    // ScheduleList에 진입했을 때 hasScheduleRequest가 없으면 설정
    // (CalAdd에서 이미 설정했지만, 직접 URL로 접근한 경우를 대비)
    const hasRequest = localStorage.getItem("hasScheduleRequest");
    if (!hasRequest) {
      console.log("📝 ScheduleList 진입: hasScheduleRequest 설정");
      localStorage.setItem("hasScheduleRequest", "true");
    }

    // 컴포넌트 언마운트 시 (다른 페이지로 이동할 때)
    return () => {
      // 생성하기를 누르지 않고 나간 경우를 감지
      const isCompleted = localStorage.getItem("scheduleGenerationCompleted");
      if (!isCompleted) {
        // 생성하기를 누르지 않고 나간 경우: hasScheduleRequest 유지
        console.log(
          "📝 ScheduleList 나감 (생성하기 미완료): hasScheduleRequest 유지",
        );
        localStorage.setItem("hasScheduleRequest", "true");
      } else {
        // 생성하기를 눌렀다면 이미 handleGenerateSchedule에서 처리됨
        console.log("📝 ScheduleList 나감 (생성하기 완료)");
      }
    };
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
        const workersList = await getAllWorker();

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
        // getActiveStore에서 userStoreId를 가져오거나, getOwnerProfile에서 가져오기
        let currentUserStoreId = null;
        const activeStore = await getActiveStore();
        if (activeStore?.userStoreId) {
          currentUserStoreId = activeStore.userStoreId;
        } else if (activeStore?.id) {
          currentUserStoreId = activeStore.id;
        } else {
          // getOwnerProfile에서 userStoreId 가져오기 시도
          const mydata = await getOwnerProfile();
          if (mydata?.userStoreId) {
            currentUserStoreId = mydata.userStoreId;
          } else if (mydata?.id) {
            currentUserStoreId = mydata.id;
          }
        }

        // 사장(현재 사용자) 제외하고 알바생만 필터링
        const storeWorkers = (workersList || []).filter((worker) => {
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
          const storeAvailabilities = await getStaffWorkAvailability(storeId);

          console.log(
            "📋 [API 응답] storeAvailabilities:",
            storeAvailabilities,
          );

          // 응답 형태: 배열 [ { userName: string, availabilities: Array } ]
          // 각 직원별로 availabilities가 빈 배열일 수 있음

          storeWorkers.forEach((worker) => {
            // 직원 이름 찾기 (여러 필드 시도)
            const workerName =
              worker.username || worker.name || worker.userName || "이름없음";

            // 직원 ID 찾기 (여러 필드 시도) - workerKey 생성용
            const staffId =
              worker.id ||
              worker.staffId ||
              worker.userStoreId ||
              worker.userId;
            // 고유 식별자 생성 (ID가 없어도 처리 가능하도록)
            const workerKey =
              staffId ||
              worker.userStoreId ||
              worker.userId ||
              `worker_${workerName}`;

            // userName 매칭을 위한 정규화 함수 (공백 제거, 대소문자 무시)
            const normalizeName = (name) => {
              if (!name) return "";
              return String(name).trim().toLowerCase();
            };

            // username으로 매칭하여 해당 직원의 availabilities 가져오기 (API는 username 소문자 사용)
            // 정확한 매칭 시도 후, 정규화된 매칭 시도
            let workerAvailability = storeAvailabilities.find((item) => {
              const apiUsername = item.username || item.userName || "";
              const normalizedApiName = normalizeName(apiUsername);
              const normalizedWorkerName = normalizeName(workerName);

              return (
                apiUsername === workerName ||
                normalizedApiName === normalizedWorkerName
              );
            });

            // 매칭 실패 시 로그 출력
            if (!workerAvailability) {
              console.warn(
                `⚠️ 직원 ${workerName}의 availabilities를 찾을 수 없습니다.`,
                {
                  workerName,
                  availableUserNames: storeAvailabilities.map(
                    (item) => item.username || item.userName,
                  ),
                  workerData: {
                    id: worker.id,
                    staffId: worker.staffId,
                    userStoreId: worker.userStoreId,
                    username: worker.username,
                    name: worker.name,
                    userName: worker.userName,
                  },
                },
              );
            }

            const availabilities = workerAvailability?.availabilities || [];

            // API 응답 형식: { dayOfWeek: "MON", startTime: "09:00", endTime: "18:00" }
            // 코드에서 사용하는 형식: { startDatetime, endDatetime }
            // dayOfWeek/startTime/endTime 형식을 startDatetime/endDatetime으로 변환
            const convertedAvailabilities = [];
            if (Array.isArray(availabilities)) {
              // 현재 주의 시작일 (일요일) 기준으로 변환
              const startOfWeek = dayjs().locale("ko").startOf("week");
              const dayMap = {
                SUN: 0,
                MON: 1,
                TUE: 2,
                WED: 3,
                THU: 4,
                FRI: 5,
                SAT: 6,
              };

              availabilities.forEach((avail) => {
                if (avail.dayOfWeek && avail.startTime && avail.endTime) {
                  // dayOfWeek/startTime/endTime 형식
                  const targetDayIndex = dayMap[avail.dayOfWeek.toUpperCase()];
                  if (targetDayIndex !== undefined) {
                    const targetDate = startOfWeek.add(targetDayIndex, "day");
                    const [startHour, startMinute] = avail.startTime
                      .split(":")
                      .map(Number);
                    const [endHour, endMinute] = avail.endTime
                      .split(":")
                      .map(Number);

                    convertedAvailabilities.push({
                      startDatetime: targetDate
                        .hour(startHour || 0)
                        .minute(startMinute || 0)
                        .second(0)
                        .toISOString(),
                      endDatetime: targetDate
                        .hour(endHour || 0)
                        .minute(endMinute || 0)
                        .second(0)
                        .toISOString(),
                    });
                  }
                } else if (avail.startDatetime && avail.endDatetime) {
                  // 이미 startDatetime/endDatetime 형식인 경우 그대로 사용
                  convertedAvailabilities.push(avail);
                }
              });

              schedulesByWorker[workerKey] = convertedAvailabilities;
              if (convertedAvailabilities.length > 0) {
                console.log(
                  `✅ 직원 ${workerName} (Key: ${workerKey}) 근무 가능 시간: ${convertedAvailabilities.length}개`,
                );
              } else {
                console.log(
                  `ℹ️ 직원 ${workerName} (Key: ${workerKey}) 근무 가능 시간 없음 (빈 배열)`,
                );
              }
            } else {
              console.warn(
                `⚠️ 직원 ${workerName} (Key: ${workerKey})의 응답이 배열이 아닙니다:`,
                availabilities,
              );
              schedulesByWorker[workerKey] = [];
            }

            // ID가 없어도 스케줄은 저장되므로 에러로 표시하지 않음
            // (ID가 없어도 workerKey로 식별 가능)
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
            const workerName = worker.username || worker.name || "이름없음";
            schedulesByWorker[staffId] = [];
            errorsByWorker[staffId] = {
              staffId,
              workerName,
              ...errorInfo,
            };
          });
        }

        const successCount = Object.keys(schedulesByWorker).filter(
          (staffId) =>
            !errorsByWorker[staffId] && schedulesByWorker[staffId]?.length > 0,
        ).length;
        const errorCount = Object.keys(errorsByWorker).length;
        const emptyCount = Object.keys(schedulesByWorker).filter(
          (staffId) =>
            !errorsByWorker[staffId] &&
            (!schedulesByWorker[staffId] ||
              schedulesByWorker[staffId].length === 0),
        ).length;

        console.log("📊 모든 직원의 스케줄 로드 완료:", {
          totalWorkers: storeWorkers.length,
          successCount,
          emptyCount,
          errorCount,
          schedulesCount: Object.keys(schedulesByWorker).length,
        });

        if (errorCount > 0) {
          console.warn(
            `⚠️ ${errorCount}명의 직원 데이터 로드 실패:`,
            errorsByWorker,
          );
        }

        if (emptyCount > 0) {
          console.log(
            `ℹ️ ${emptyCount}명의 직원은 근무 가능 시간이 없습니다 (제출 안 함)`,
          );
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
    // 직원 고유 키 찾기 (여러 필드 시도)
    const workerKey =
      worker?.id ||
      worker?.staffId ||
      worker?.userStoreId ||
      worker?.userId ||
      `worker_${worker.username || worker.name || worker.userName || "unknown"}`;
    const schedules = workerSchedules[workerKey] || [];
    const error = workerErrors[workerKey];

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
      // 직원 고유 키 찾기 (여러 필드 시도)
      const workerKey =
        worker.id ||
        worker.staffId ||
        worker.userStoreId ||
        worker.userId ||
        `worker_${worker.username || worker.name || worker.userName || "unknown"}`;
      const schedules = workerSchedules[workerKey] || [];
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

    if (!scheduleRequestId) {
      alert(
        "설정 정보를 불러올 수 없습니다. 먼저 근무표 생성 요청을 해주세요.",
      );
      return;
    }

    // 제출 상태 확인
    if (storeId) {
      try {
        const status = await getSubmissionStatus(storeId);
        console.log("📊 제출 상태 확인:", status);

        // 응답 형식에 따라 제출 완료 여부 확인
        // CASE 1: allSubmitted 필드가 있는 경우
        if (status?.allSubmitted === false) {
          const submitted = status.submitted || 0;
          const total = status.totalEmployees || 0;
          alert(
            `아직 제출하지 않은 직원이 있습니다.\n제출 완료: ${submitted}/${total}명`,
          );
          return;
        }

        // CASE 2: 직원별 제출 상태가 객체인 경우
        if (status && typeof status === "object" && !Array.isArray(status)) {
          const employeeNames = Object.keys(status);
          const notSubmitted = employeeNames.filter(
            (name) => !status[name] || status[name]?.submitted === false,
          );
          if (notSubmitted.length > 0) {
            alert(
              `아직 제출하지 않은 직원이 있습니다.\n미제출: ${notSubmitted.join(", ")}`,
            );
            return;
          }
        }
      } catch (error) {
        console.error("제출 상태 확인 실패:", error);
        // 제출 상태 확인 실패 시에도 진행 가능하도록 경고만 표시
        const shouldContinue = window.confirm(
          "제출 상태를 확인할 수 없습니다. 계속 진행하시겠습니까?",
        );
        if (!shouldContinue) return;
      }
    }

    try {
      setIsGenerating(true);

      // /api/schedules/requests/{scheduleRequestId}/generate API 호출
      // generationOptions에 candidateCount 포함 (기본값: 5)
      const result = await generateScheduleByTime(scheduleRequestId, 5);

      if (result && result.candidateScheduleKey) {
        // 근무표 생성 완료 플래그 저장 (다음에 caladdicon 클릭 시 CalAdd로 이동)
        localStorage.setItem("scheduleGenerationCompleted", "true");
        localStorage.removeItem("hasScheduleRequest"); // 생성 완료했으므로 요청 플래그 제거
        localStorage.removeItem("scheduleConfig"); // 생성 완료했으므로 설정 정보 제거

        console.log(
          "✅ 근무표 생성 완료: scheduleGenerationCompleted 설정, hasScheduleRequest 및 scheduleConfig 제거",
        );

        const startDate =
          scheduleConfig.startDate ||
          dayjs().locale("ko").startOf("week").format("YYYY-MM-DD");
        const endDate =
          scheduleConfig.endDate ||
          dayjs()
            .locale("ko")
            .startOf("week")
            .add(6, "day")
            .format("YYYY-MM-DD");

        navigate("/autoCal", {
          state: {
            scheduleRequestId,
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
    <div className="w-full h-full bg-[#f8f9fd] flex flex-col">
      <TopBar title="근무표 생성" onBack={() => navigate("/owner")} />

      {/* 상단바를 고정하고, 나머지 영역만 스크롤 되도록 처리 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 flex flex-col gap-4">
          <p className="text-center font-bold text-lg">직원 스케줄 목록</p>

          {/* 제출 상태 표시 */}
          {submissionStatus && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  근무표 생성 요청 상태
                </span>
                {isLoadingStatus && (
                  <span className="text-xs text-blue-600">확인 중...</span>
                )}
              </div>
              {(() => {
                // 응답 형식에 따라 표시
                if (submissionStatus.allSubmitted !== undefined) {
                  const submitted = submissionStatus.submitted || 0;
                  const total = submissionStatus.totalEmployees || 0;
                  const allSubmitted = submissionStatus.allSubmitted;
                  return (
                    <div className="mt-2">
                      <p className="text-sm text-blue-800">
                        {allSubmitted ? (
                          <span className="font-semibold text-green-600">
                            ✅ 모든 직원 제출 완료 ({submitted}/{total}명)
                          </span>
                        ) : (
                          <span className="font-semibold text-orange-600">
                            ⏳ 제출 진행 중 ({submitted}/{total}명)
                          </span>
                        )}
                      </p>
                    </div>
                  );
                } else if (
                  typeof submissionStatus === "object" &&
                  !Array.isArray(submissionStatus)
                ) {
                  const employeeNames = Object.keys(submissionStatus);
                  const submittedCount = employeeNames.filter(
                    (name) =>
                      submissionStatus[name] === true ||
                      submissionStatus[name]?.submitted === true,
                  ).length;
                  const totalCount = employeeNames.length;
                  return (
                    <div className="mt-2">
                      <p className="text-sm text-blue-800">
                        {submittedCount === totalCount ? (
                          <span className="font-semibold text-green-600">
                            ✅ 모든 직원 제출 완료 ({submittedCount}/{totalCount}명)
                          </span>
                        ) : (
                          <span className="font-semibold text-orange-600">
                            ⏳ 제출 진행 중 ({submittedCount}/{totalCount}명)
                          </span>
                        )}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          <div className="flex justify-center">
            <TimeSlotCalendar
              onTimeSlotClick={handleTimeSlotClick}
              getAvailabilityCount={getAvailabilityCount}
            />
          </div>

          <div className="w-[90%] mx-auto">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium">
                전체 직원 가능 근무 시간대
              </p>
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
              {workers.map((worker, index) => {
                // 직원 고유 키 찾기 (여러 필드 시도)
                const workerKey =
                  worker.id ||
                  worker.staffId ||
                  worker.userStoreId ||
                  worker.userId ||
                  `worker_${index}`;
                const hasError = workerErrors[workerKey];
                const errorStatus = hasError?.status;

                return (
                  <div
                    key={workerKey}
                    className={`flex items-center gap-3 p-3 rounded-lg shadow-sm ${
                      hasError ? "bg-red-50 border border-red-200" : "bg-white"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full border-2 border-white shadow-sm ${
                        hasError ? "bg-red-300" : "bg-[#68E194]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold truncate">
                          {worker.username ||
                            worker.name ||
                            worker.userName ||
                            "이름 없음"}
                        </p>
                        {hasError && (
                          <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                            ⚠️ 오류
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm mt-1 ${
                          hasError
                            ? "text-red-600 font-medium"
                            : "text-gray-600"
                        }`}
                      >
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
      </div>

      <BottomBar
        singleButton
        singleButtonText={isGenerating ? "생성 중..." : "생성하기"}
        onSingleClick={handleGenerateSchedule}
        disabledSingle={
          isGenerating ||
          (submissionStatus &&
            typeof submissionStatus === "object" &&
            !Array.isArray(submissionStatus) &&
            submissionStatus.allSubmitted === false)
        }
      />

      <Toast isOpen={toastOpen} onClose={() => setToastOpen(false)}>
        <p className="text-lg font-bold mb-4">
          {selectedDay && selectedHour !== null
            ? `${selectedDay} ${selectedHour}시 근무 가능 직원`
            : "근무 가능 직원"}
        </p>
        {selectedDay && selectedHour !== null ? (
          (() => {
            const availableWorkers = getAvailableWorkers(
              selectedDay,
              selectedHour,
            );
            return availableWorkers.length > 0 ? (
              <div className="flex flex-col gap-3">
                {availableWorkers.map((worker) => (
                  <div key={worker.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#68E194] rounded-full border-2 border-white shadow-sm" />
                    <p className="text-base font-semibold">
                      {worker.username ||
                        worker.name ||
                        worker.userName ||
                        "이름 없음"}
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
