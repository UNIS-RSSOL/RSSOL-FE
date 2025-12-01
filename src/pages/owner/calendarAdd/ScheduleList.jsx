import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import TimeSlotCalendar from "../../../components/common/calendar/TimeSlotCalendar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import Toast from "../../../components/common/Toast.jsx";
import { fetchAllWorkers } from "../../../services/owner/ScheduleService.js";
import { fetchSchedules } from "../../../services/common/ScheduleService.js";

function ScheduleList() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [workerSchedules, setWorkerSchedules] = useState({});
  const [toastOpen, setToastOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);

  // 직원 리스트 및 스케줄 가져오기
  useEffect(() => {
    const loadWorkersAndSchedules = async () => {
      try {
        const startOfWeek = dayjs().locale("ko").startOf("week");
        const endOfWeek = startOfWeek.add(6, "day");
        
        // 직원 리스트 가져오기
        const workersList = await fetchAllWorkers();
        setWorkers(workersList || []);

        // 각 직원의 스케줄 가져오기
        const schedules = await fetchSchedules(
          startOfWeek.format("YYYY-MM-DD"),
          endOfWeek.format("YYYY-MM-DD")
        );

        // 직원별로 스케줄 그룹화
        const schedulesByWorker = {};
        if (schedules && Array.isArray(schedules)) {
          schedules.forEach((schedule) => {
            const workerId = schedule.userStoreId;
            if (!schedulesByWorker[workerId]) {
              schedulesByWorker[workerId] = [];
            }
            schedulesByWorker[workerId].push(schedule);
          });
        }
        setWorkerSchedules(schedulesByWorker);
      } catch (error) {
        console.error("직원 및 스케줄 로드 실패:", error);
      }
    };
    loadWorkersAndSchedules();
  }, []);

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
      const schedules = workerSchedules[worker.id] || [];
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
      <TopBar title="근무표 생성" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-3 flex flex-col gap-4 overflow-y-auto">
        <p className="text-center font-bold text-lg">직원 스케줄 목록</p>
        
        <div className="flex justify-center">
          <TimeSlotCalendar onTimeSlotClick={handleTimeSlotClick} />
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
            {workers.map((worker) => (
                <div
                key={worker.id}
                className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                >
                <div className="flex-shrink-0 w-12 h-12 bg-[#68E194] rounded-full border-2 border-white shadow-sm" />
                <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold truncate">
                    {worker.name || worker.userName || "이름 없음"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                    {formatAvailableTimes(worker.id)}
                    </p>
                </div>
                </div>
            ))}
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
        singleButtonText="생성하기"
        onSingleClick={() => navigate("/autoCal")}
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

