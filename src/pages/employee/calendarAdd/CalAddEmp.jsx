import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import EmployeeScheduleCalendar from "../../../components/common/calendar/EmployeeScheduleCalendar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import { addAvailability } from "../../../services/employee/ScheduleService.js";
import { fetchSchedules } from "../../../services/common/ScheduleService.js";
import {
  fetchActiveStore,
  fetchMydata,
} from "../../../services/employee/MyPageService.js";

function CalAddEmp() {
  const navigate = useNavigate();
  const [currentDate] = useState(dayjs().locale("ko"));
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
  const [employeeUserId, setEmployeeUserId] = useState(null);
  const [employeeStoreId, setEmployeeStoreId] = useState(null);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [isLoadingEmployeeInfo, setIsLoadingEmployeeInfo] = useState(true);

  // 알바생의 userId와 storeId 가져오기
  useEffect(() => {
    const loadEmployeeInfo = async () => {
      setIsLoadingEmployeeInfo(true);
      try {
        // 먼저 activeStore에서 storeId 확인
        const activeStore = await fetchActiveStore();
        console.log("fetchActiveStore 응답:", activeStore);

        // activeStore에서 storeId 가져오기
        let storeId = null;
        if (activeStore && activeStore.storeId) {
          storeId = activeStore.storeId;
        } else if (activeStore && activeStore.id) {
          storeId = activeStore.id;
        }

        // mydata에서 userId 가져오기
        const mydata = await fetchMydata();
        console.log("fetchMydata 응답:", mydata);

        let userId = null;
        if (mydata && mydata.userId) {
          userId = mydata.userId;
        } else if (mydata && mydata.id) {
          userId = mydata.id;
        }

        // storeId가 없으면 mydata의 currentStore에서 가져오기
        if (!storeId && mydata && mydata.currentStore) {
          if (mydata.currentStore.storeId) {
            storeId = mydata.currentStore.storeId;
          } else if (mydata.currentStore.id) {
            storeId = mydata.currentStore.id;
          }
        }

        if (userId && storeId) {
          console.log("userId와 storeId 찾음:", { userId, storeId });
          setEmployeeUserId(userId);
          setEmployeeStoreId(storeId);
        } else {
          console.error(
            "userId 또는 storeId를 찾을 수 없습니다. userId:",
            userId,
            "storeId:",
            storeId,
            "activeStore:",
            activeStore,
            "mydata:",
            mydata,
          );
        }
      } catch (error) {
        console.error("알바생 정보 로드 실패:", error);
        console.error("에러 상세:", error.response?.data || error.message);
      } finally {
        setIsLoadingEmployeeInfo(false);
      }
    };
    loadEmployeeInfo();
  }, []);

  // 현재 주의 기존 스케줄 확인
  useEffect(() => {
    const checkExistingSchedules = async () => {
      try {
        const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
        const endOfWeek = startOfWeek.add(6, "day");
        const schedules = await fetchSchedules(
          startOfWeek.format("YYYY-MM-DD"),
          endOfWeek.format("YYYY-MM-DD"),
        );
        setExistingSchedules(schedules || []);
      } catch (error) {
        console.error("기존 스케줄 확인 실패:", error);
      }
    };
    checkExistingSchedules();
  }, [currentDate]);

  // 시간 블록 클릭 핸들러
  const handleTimeSlotClick = (day, hour) => {
    const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const dayIndex = days.indexOf(day);
    if (dayIndex === -1) return;

    const targetDate = startOfWeek.add(dayIndex, "day");
    const key = `${targetDate.format("YYYY-MM-DD")}-${day}-${hour}`;
    const newSelected = new Set(selectedTimeSlots);

    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }

    setSelectedTimeSlots(newSelected);
  };

  // 스케줄 추가하기
  const handleAddSchedule = async () => {
    if (selectedTimeSlots.size === 0) {
      alert("시간을 선택해주세요.");
      return;
    }

    if (isLoadingEmployeeInfo) {
      alert("알바생 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!employeeUserId || !employeeStoreId) {
      console.error(
        "employeeUserId 또는 employeeStoreId가 null입니다. userId:",
        employeeUserId,
        "storeId:",
        employeeStoreId,
      );
      alert("알바생 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const schedulesToAdd = [];
    const conflictMessages = [];

    selectedTimeSlots.forEach((slotKey) => {
      const parts = slotKey.split("-");
      if (parts.length < 5) return;

      const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
      const dayName = parts[3];
      const hourStr = parts[4];

      const targetDate = dayjs(dateStr);
      const hour = parseInt(hourStr);
      const startDatetime = targetDate.hour(hour).minute(0).second(0);
      const endDatetime = startDatetime.add(1, "hour");

      // 기존 스케줄과 중복 확인
      const hasConflict = existingSchedules.some((schedule) => {
        // userId로 중복 확인 (schedule에 userId 필드가 있는 경우)
        if (
          employeeUserId &&
          schedule.userId &&
          schedule.userId !== employeeUserId
        ) {
          return false;
        }
        // userStoreId로 중복 확인 (기존 호환성을 위해)
        if (
          employeeUserId &&
          schedule.userStoreId &&
          schedule.userStoreId !== employeeUserId
        ) {
          return false;
        }
        const scheduleStart = dayjs(schedule.startDatetime);
        const scheduleEnd = dayjs(schedule.endDatetime);
        return (
          scheduleStart.isBefore(endDatetime) &&
          scheduleEnd.isAfter(startDatetime)
        );
      });

      if (hasConflict) {
        conflictMessages.push(`${targetDate.format("MM월 DD일")} ${hour}시`);
        return;
      }

      schedulesToAdd.push({
        start: startDatetime.format("YYYY-MM-DDTHH:mm"),
        end: endDatetime.format("YYYY-MM-DDTHH:mm"),
      });
    });

    if (conflictMessages.length > 0) {
      alert(
        `다음 시간에 이미 스케줄이 있습니다:\n${conflictMessages.join(", ")}\n\n중복되지 않는 시간을 선택해주세요.`,
      );
      return;
    }

    if (schedulesToAdd.length === 0) {
      alert("추가할 수 있는 스케줄이 없습니다.");
      return;
    }

    // work availability 추가 (연속된 시간대를 하나의 availability로 그룹화)
    try {
      // 연속된 시간대를 하나의 availability로 그룹화
      const availabilityGroups = [];
      if (schedulesToAdd.length > 0) {
        // 날짜와 시간으로 정렬
        const sortedSchedules = [...schedulesToAdd].sort((a, b) => {
          const dateA = new Date(a.start);
          const dateB = new Date(b.start);
          return dateA - dateB;
        });

        let currentGroup = null;
        sortedSchedules.forEach((schedule) => {
          const scheduleStart = dayjs(schedule.start);
          const scheduleEnd = dayjs(schedule.end);

          if (!currentGroup) {
            currentGroup = {
              start: scheduleStart,
              end: scheduleEnd,
            };
          } else {
            // 연속된 시간대인지 확인 (같은 날짜이고 1시간 차이)
            if (
              currentGroup.end.isSame(scheduleStart) &&
              currentGroup.start.format("YYYY-MM-DD") === scheduleStart.format("YYYY-MM-DD")
            ) {
              currentGroup.end = scheduleEnd;
            } else {
              // 새로운 그룹 시작
              availabilityGroups.push(currentGroup);
              currentGroup = {
                start: scheduleStart,
                end: scheduleEnd,
              };
            }
          }
        });
        
        if (currentGroup) {
          availabilityGroups.push(currentGroup);
        }
      }

      // work availability 추가
      console.log("work availability 추가 시작, 그룹 수:", availabilityGroups.length);
      for (const group of availabilityGroups) {
        const startStr = group.start.format("YYYY-MM-DDTHH:mm:ss");
        const endStr = group.end.format("YYYY-MM-DDTHH:mm:ss");
        console.log("availability 추가:", { startStr, endStr });
        await addAvailability(startStr, endStr);
      }
      
      alert("근무 가능 시간이 추가되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("근무 가능 시간 추가 실패:", error);
      alert("근무 가능 시간 추가에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
      <TopBar title="근무표 생성" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-3 flex flex-col gap-4 overflow-y-auto">
        <div className="text-lg font-semibold">내 스케줄 추가</div>

        <div className="flex justify-center">
          <EmployeeScheduleCalendar
            date={currentDate}
            onTimeSlotClick={handleTimeSlotClick}
            selectedTimeSlots={selectedTimeSlots}
          />
        </div>
      </div>

      <BottomBar
        singleButton
        singleButtonText="스케줄 추가하기"
        onSingleClick={handleAddSchedule}
      />
    </div>
  );
}

export default CalAddEmp;
