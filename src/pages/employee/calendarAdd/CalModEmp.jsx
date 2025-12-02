import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import EmployeeScheduleCalendar from "../../../components/common/calendar/EmployeeScheduleCalendar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import {
  fetchMyAvailabilities,
  addAvailability,
  deleteAvailability,
} from "../../../services/employee/ScheduleService.js";
import {
  fetchActiveStore,
  fetchMydata,
} from "../../../services/employee/MyPageService.js";

function CalModEmp() {
  const navigate = useNavigate();
  const [currentDate] = useState(dayjs().locale("ko"));
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
  const [employeeUserId, setEmployeeUserId] = useState(null);
  const [employeeStoreId, setEmployeeStoreId] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoadingEmployeeInfo, setIsLoadingEmployeeInfo] = useState(true);
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(true);

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

  // work availability 불러오기 및 초기 선택 상태 설정
  useEffect(() => {
    const loadAvailabilities = async () => {
      setIsLoadingAvailabilities(true);
      try {
        const availabilityData = await fetchMyAvailabilities();
        setAvailabilities(availabilityData || []);

        // work availability를 selectedTimeSlots에 추가
        if (availabilityData && Array.isArray(availabilityData) && availabilityData.length > 0) {
          const days = ["일", "월", "화", "수", "목", "금", "토"];
          const initialSelected = new Set();
          const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");

          availabilityData.forEach((availability) => {
            const availabilityStart = dayjs(availability.startDatetime);
            const availabilityEnd = dayjs(availability.endDatetime);
            
            // 현재 주의 범위 내에 있는 availability만 표시
            const endOfWeek = startOfWeek.add(6, "day");
            if (availabilityStart.isAfter(endOfWeek) || availabilityEnd.isBefore(startOfWeek)) {
              return;
            }

            // 주의 시작일부터 끝일까지 반복
            let currentDate = startOfWeek;
            while (currentDate.isBefore(endOfWeek) || currentDate.isSame(endOfWeek, "day")) {
              const dayName = days[currentDate.day()];
              
              // 이 날짜에 해당하는 availability 시간대 확인
              const dayStart = currentDate.startOf("day");
              const dayEnd = currentDate.endOf("day");
              
              // availability가 이 날짜와 겹치는지 확인
              if (availabilityStart.isBefore(dayEnd) && availabilityEnd.isAfter(dayStart)) {
                // 겹치는 시간대 계산
                const overlapStart = dayjs.max(availabilityStart, dayStart);
                const overlapEnd = dayjs.min(availabilityEnd, dayEnd);
                
                let currentHour = overlapStart.hour();
                const endHour = overlapEnd.hour();
                
                while (currentHour < endHour) {
                  const slotKey = `${currentDate.format("YYYY-MM-DD")}-${dayName}-${currentHour}`;
                  initialSelected.add(slotKey);
                  currentHour++;
                }
              }
              
              currentDate = currentDate.add(1, "day");
            }
          });

          setSelectedTimeSlots(initialSelected);
        }
      } catch (error) {
        console.error("work availability 로드 실패:", error);
      } finally {
        setIsLoadingAvailabilities(false);
      }
    };
    
    loadAvailabilities();
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

  // work availability 수정하기
  const handleModifySchedule = async () => {
    if (isLoadingEmployeeInfo || isLoadingAvailabilities) {
      alert("정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
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
    
    // 기존 availability 삭제
    const availabilitiesToDelete = availabilities || [];

    // 새로운 availability 추가할 시간대 계산
    // 연속된 시간대를 하나의 availability로 그룹화
    const availabilityGroups = [];
    const sortedSlots = Array.from(selectedTimeSlots).sort();
    
    if (sortedSlots.length > 0) {
      let currentGroup = null;
      
      sortedSlots.forEach((slotKey) => {
        const parts = slotKey.split("-");
        if (parts.length < 5) return;

        const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const dayName = parts[3];
        const hourStr = parts[4];

        const targetDate = dayjs(dateStr);
        const hour = parseInt(hourStr);
        const startDatetime = targetDate.hour(hour).minute(0).second(0);
        const endDatetime = startDatetime.add(1, "hour");

        if (!currentGroup) {
          currentGroup = {
            start: startDatetime,
            end: endDatetime,
          };
        } else {
          // 연속된 시간대인지 확인 (같은 날짜이고 1시간 차이)
          if (
            currentGroup.end.isSame(startDatetime) &&
            currentGroup.start.format("YYYY-MM-DD") === startDatetime.format("YYYY-MM-DD")
          ) {
            currentGroup.end = endDatetime;
          } else {
            // 새로운 그룹 시작
            availabilityGroups.push(currentGroup);
            currentGroup = {
              start: startDatetime,
              end: endDatetime,
            };
          }
        }
      });
      
      if (currentGroup) {
        availabilityGroups.push(currentGroup);
      }
    }

    // work availability 수정 (기존 삭제 후 새로 추가)
    try {
      // 기존 availability 삭제
      for (const availability of availabilitiesToDelete) {
        if (availability.id) {
          await deleteAvailability(availability.id);
        }
      }

      // 새로운 availability 추가
      for (const group of availabilityGroups) {
        await addAvailability(
          group.start.format("YYYY-MM-DDTHH:mm:ss"),
          group.end.format("YYYY-MM-DDTHH:mm:ss")
        );
      }
      
      alert("근무 가능 시간이 수정되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("근무 가능 시간 수정 실패:", error);
      alert("근무 가능 시간 수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
      <TopBar title="근무표 생성" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-3 flex flex-col gap-4 overflow-y-auto">
        <div className="text-lg font-semibold">내 스케줄 수정</div>

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
        singleButtonText="스케줄 수정하기"
        onSingleClick={handleModifySchedule}
      />
    </div>
  );
}

export default CalModEmp;

