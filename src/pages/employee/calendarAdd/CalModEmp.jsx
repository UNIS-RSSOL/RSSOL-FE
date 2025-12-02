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
  const [employeeUserName, setEmployeeUserName] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [isLoadingEmployeeInfo, setIsLoadingEmployeeInfo] = useState(true);
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // 중복 실행 방지

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

        // mydata에서 userId와 userName 가져오기
        const mydata = await fetchMydata();
        console.log("fetchMydata 응답:", mydata);

        let userId = null;
        if (mydata && mydata.userId) {
          userId = mydata.userId;
        } else if (mydata && mydata.id) {
          userId = mydata.id;
        }

        let userName = null;
        if (mydata && mydata.username) {
          userName = mydata.username;
        } else if (mydata && mydata.userName) {
          userName = mydata.userName;
        } else if (mydata && mydata.name) {
          userName = mydata.name;
        }

        // storeId가 없으면 mydata의 currentStore에서 가져오기
        if (!storeId && mydata && mydata.currentStore) {
          if (mydata.currentStore.storeId) {
            storeId = mydata.currentStore.storeId;
          } else if (mydata.currentStore.id) {
            storeId = mydata.currentStore.id;
          }
        }

        if (userId && storeId && userName) {
          console.log("userId, storeId, userName 찾음:", { userId, storeId, userName });
          setEmployeeUserId(userId);
          setEmployeeStoreId(storeId);
          setEmployeeUserName(userName);
        } else {
          console.error(
            "userId, storeId 또는 userName을 찾을 수 없습니다. userId:",
            userId,
            "storeId:",
            storeId,
            "userName:",
            userName,
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
        console.log("🔍 CalModEmp: work availability 불러오기 시작");
        const availabilityData = await fetchMyAvailabilities();
        console.log("🔍 CalModEmp: fetchMyAvailabilities 응답:", availabilityData);
        console.log("🔍 CalModEmp: availability 개수:", availabilityData?.length || 0);
        
        // availability 데이터 구조 확인
        if (availabilityData && availabilityData.length > 0) {
          console.log("🔍 CalModEmp: 첫 번째 availability 샘플:", availabilityData[0]);
          console.log("🔍 CalModEmp: 모든 availability ID 목록:", availabilityData.map(a => a.id || 'NO_ID'));
        }
        
        setAvailabilities(availabilityData || []);

        // work availability를 selectedTimeSlots에 추가
        if (availabilityData && Array.isArray(availabilityData) && availabilityData.length > 0) {
          console.log("🔍 CalModEmp: availability 데이터가 있음, selectedTimeSlots 설정 시작");
          const days = ["일", "월", "화", "수", "목", "금", "토"];
          const initialSelected = new Set();
          const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
          const endOfWeek = startOfWeek.add(6, "day").endOf("day");

          availabilityData.forEach((availability) => {
            // availability 데이터 구조 확인: startDatetime/endDatetime 또는 dayOfWeek/startTime/endTime
            let availabilityStart, availabilityEnd;
            
            if (availability.startDatetime && availability.endDatetime) {
              // 특정 날짜/시간 형식
              availabilityStart = dayjs(availability.startDatetime);
              availabilityEnd = dayjs(availability.endDatetime);
            } else if (availability.dayOfWeek && availability.startTime && availability.endTime) {
              // 주기적 패턴 형식 (dayOfWeek, startTime, endTime)
              // 현재 주의 해당 요일 찾기
              const dayMap = { "SUN": 0, "MON": 1, "TUE": 2, "WED": 3, "THU": 4, "FRI": 5, "SAT": 6 };
              const targetDayIndex = dayMap[availability.dayOfWeek.toUpperCase()];
              
              if (targetDayIndex === undefined) {
                console.warn("⚠️ 알 수 없는 요일:", availability.dayOfWeek);
                return;
              }
              
              // 현재 주의 해당 요일 찾기
              const targetDate = startOfWeek.add(targetDayIndex, "day");
              
              // startTime과 endTime을 파싱 (HH:mm 형식)
              const [startHour, startMinute] = availability.startTime.split(":").map(Number);
              const [endHour, endMinute] = availability.endTime.split(":").map(Number);
              
              availabilityStart = targetDate.hour(startHour).minute(startMinute || 0).second(0);
              availabilityEnd = targetDate.hour(endHour).minute(endMinute || 0).second(0);
            } else {
              console.warn("⚠️ 알 수 없는 availability 형식:", availability);
              return;
            }
            
            // 현재 주의 범위 내에 있는 availability만 표시
            if (availabilityStart.isAfter(endOfWeek) || availabilityEnd.isBefore(startOfWeek)) {
              return;
            }

            // 겹치는 날짜 범위 계산
            const overlapStartDate = availabilityStart.isAfter(startOfWeek) ? availabilityStart : startOfWeek;
            const overlapEndDate = availabilityEnd.isBefore(endOfWeek) ? availabilityEnd : endOfWeek;
            
            // 겹치는 날짜들에 대해 시간 슬롯 추가
            let currentDate = overlapStartDate.startOf("day");
            while (currentDate.isBefore(overlapEndDate) || currentDate.isSame(overlapEndDate, "day")) {
              const dayName = days[currentDate.day()];
              const dayStart = currentDate.startOf("day");
              const dayEnd = currentDate.endOf("day");
              
              // 이 날짜에 availability가 겹치는지 확인
              if (availabilityStart.isBefore(dayEnd) && availabilityEnd.isAfter(dayStart)) {
                // 이 날짜에서 겹치는 시간 범위 계산
                const dayOverlapStart = availabilityStart.isAfter(dayStart) ? availabilityStart : dayStart;
                const dayOverlapEnd = availabilityEnd.isBefore(dayEnd) ? availabilityEnd : dayEnd;
                
                // 시간 단위로 슬롯 추가
                let currentHour = dayOverlapStart.hour();
                const endHour = dayOverlapEnd.hour();
                
                // endHour가 dayOverlapEnd의 분이 0이 아니면 포함
                const shouldIncludeEndHour = dayOverlapEnd.minute() > 0 || dayOverlapEnd.second() > 0;
                const finalEndHour = shouldIncludeEndHour ? endHour : endHour - 1;
                
                while (currentHour <= finalEndHour) {
                  const slotKey = `${currentDate.format("YYYY-MM-DD")}-${dayName}-${currentHour}`;
                  initialSelected.add(slotKey);
                  currentHour++;
                }
              }
              
              currentDate = currentDate.add(1, "day");
            }
          });

          setSelectedTimeSlots(initialSelected);
          console.log("🔍 CalModEmp: selectedTimeSlots 설정 완료, 개수:", initialSelected.size);
          console.log("🔍 CalModEmp: selectedTimeSlots 샘플:", Array.from(initialSelected).slice(0, 5));
        } else {
          console.log("🔍 CalModEmp: availability 데이터가 없음");
        }
      } catch (error) {
        console.error("❌ CalModEmp: work availability 로드 실패:", error);
        console.error("❌ CalModEmp: 에러 상세:", error.response?.data || error.message);
      } finally {
        setIsLoadingAvailabilities(false);
      }
    };
    
    // employeeUserId와 employeeStoreId가 로드된 후에만 실행
    if (!isLoadingEmployeeInfo && employeeUserId && employeeStoreId) {
      loadAvailabilities();
    }
  }, [currentDate, isLoadingEmployeeInfo, employeeUserId, employeeStoreId]);

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
    // 중복 실행 방지
    if (isSubmitting) {
      console.warn("⚠️ 이미 처리 중입니다. 중복 요청을 무시합니다.");
      return;
    }

    if (isLoadingEmployeeInfo || isLoadingAvailabilities) {
      alert("정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!employeeUserId || !employeeStoreId || !employeeUserName) {
      console.error(
        "employeeUserId, employeeStoreId 또는 employeeUserName이 null입니다. userId:",
        employeeUserId,
        "storeId:",
        employeeStoreId,
        "userName:",
        employeeUserName,
      );
      alert("알바생 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true); // 제출 시작

    const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    
    // 기존 availability 삭제
    const availabilitiesToDelete = availabilities || [];

    // 요일을 영어 약자로 변환하는 함수
    const getDayOfWeek = (dayjsDate) => {
      const day = dayjsDate.day(); // 0=일요일, 1=월요일, ..., 6=토요일
      const dayMap = {
        0: "SUN",
        1: "MON",
        2: "TUE",
        3: "WED",
        4: "THU",
        5: "FRI",
        6: "SAT",
      };
      return dayMap[day];
    };

    // 새로운 availability 추가할 시간대 계산
    // 날짜별로 그룹화한 후, 각 날짜 내에서 연속된 시간대만 하나로 합침
    const schedulesByDate = {};
    const sortedSlots = Array.from(selectedTimeSlots).sort();
    
    if (sortedSlots.length > 0) {
      sortedSlots.forEach((slotKey) => {
        const parts = slotKey.split("-");
        if (parts.length < 5) return;

        const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const hourStr = parts[4];

        const targetDate = dayjs(dateStr);
        const hour = parseInt(hourStr);
        const startDatetime = targetDate.hour(hour).minute(0).second(0);
        const endDatetime = startDatetime.add(1, "hour");
        
        const dateKey = targetDate.format("YYYY-MM-DD");
        if (!schedulesByDate[dateKey]) {
          schedulesByDate[dateKey] = [];
        }
        schedulesByDate[dateKey].push({
          start: startDatetime,
          end: endDatetime,
        });
      });
    }

    // 각 날짜별로 연속된 시간대를 그룹화하여 availabilities 배열 생성
    const availabilitiesList = [];
    Object.keys(schedulesByDate).forEach((dateKey) => {
      const daySchedules = schedulesByDate[dateKey];
      const firstSchedule = daySchedules[0];
      const dayOfWeek = getDayOfWeek(firstSchedule.start);
      
      // 같은 날짜의 연속된 시간대를 하나로 합침
      let currentGroup = null;
      daySchedules.forEach((schedule) => {
        if (!currentGroup) {
          currentGroup = {
            start: schedule.start,
            end: schedule.end,
          };
        } else {
          // 같은 날짜에서 연속된 시간대인지 확인 (끝 시간과 시작 시간이 같음)
          if (currentGroup.end.isSame(schedule.start)) {
            // 연속된 시간대이므로 합침
            currentGroup.end = schedule.end;
          } else {
            // 연속되지 않은 시간대이므로 별도 availability로 추가
            availabilitiesList.push({
              dayOfWeek: dayOfWeek,
              startTime: currentGroup.start.format("HH:mm"),
              endTime: currentGroup.end.format("HH:mm"),
            });
            currentGroup = {
              start: schedule.start,
              end: schedule.end,
            };
          }
        }
      });
      
      // 마지막 그룹 추가
      if (currentGroup) {
        availabilitiesList.push({
          dayOfWeek: dayOfWeek,
          startTime: currentGroup.start.format("HH:mm"),
          endTime: currentGroup.end.format("HH:mm"),
        });
      }
    });

    // work availability 수정 (기존 삭제 후 새로 추가)
    try {
      // 삭제 전에 최신 availability 목록을 다시 가져와서 실제 존재하는 ID만 삭제
      let currentAvailabilities = [];
      try {
        currentAvailabilities = await fetchMyAvailabilities();
      } catch (error) {
        console.warn("⚠️ 최신 availability 목록 조회 실패, 기존 목록 사용");
        currentAvailabilities = availabilitiesToDelete;
      }
      
      // 실제 존재하는 ID만 필터링
      const validIds = new Set(currentAvailabilities.map(a => a.id).filter(Boolean));
      const availabilitiesToDeleteFiltered = availabilitiesToDelete.filter(a => a.id && validIds.has(a.id));
      
      if (availabilitiesToDeleteFiltered.length === 0 && availabilitiesToDelete.length > 0) {
        console.warn("⚠️ 삭제할 유효한 availability가 없습니다. 모든 ID가 서버에 존재하지 않을 수 있습니다.");
      }
      
      // 기존 availability 삭제 (에러가 발생해도 계속 진행)
      // 중복 삭제 방지를 위한 Set 사용
      const deleteIds = new Set();
      const deletePromises = [];
      const deleteResults = [];
      
      for (const availability of availabilitiesToDeleteFiltered) {
        if (availability.id) {
          // 중복 ID 체크
          if (deleteIds.has(availability.id)) {
            continue; // 중복 삭제 요청 무시
          }
          deleteIds.add(availability.id);
          
          deletePromises.push(
            deleteAvailability(availability.id)
              .then((result) => {
                deleteResults.push({ id: availability.id, success: true });
                return result;
              })
              .catch((error) => {
                const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류';
                const errorStatus = error.response?.status || 'N/A';
                
                // "No static resource" 에러는 라우팅 문제로 간주하고 조용히 처리
                if (!errorMessage.includes('No static resource') && errorStatus !== 500) {
                  console.warn(`⚠️ availability ${availability.id} 삭제 실패 (${errorStatus}):`, errorMessage);
                }
                
                deleteResults.push({ id: availability.id, success: false, error: errorMessage });
                // 삭제 실패해도 계속 진행 (이미 삭제되었거나 존재하지 않는 경우)
                return null;
              })
          );
        } else {
          console.warn(`⚠️ ID가 없는 availability 발견:`, availability);
        }
      }
      
      // 모든 삭제 요청 병렬 처리 (하지만 순차적으로 처리하여 서버 부하 감소)
      if (deletePromises.length > 0) {
        // 병렬 처리 대신 순차 처리로 변경 (서버 부하 감소)
        for (let i = 0; i < deletePromises.length; i++) {
          try {
            await deletePromises[i];
          } catch (error) {
            // 이미 catch에서 처리됨
          }
        }
      }
      
      const successCount = deleteResults.filter(r => r.success).length;
      const failCount = deleteResults.filter(r => !r.success).length;
      
      if (availabilitiesToDeleteFiltered.length > 0) {
        console.log(`✅ availability 삭제 완료 (성공: ${successCount}, 실패: ${failCount})`);
      }

      // 새로운 availability 추가 (백엔드 DTO 구조에 맞게 payload 생성)
      if (availabilitiesList.length > 0) {
        const payload = {
          userStoreId: employeeStoreId,
          userName: employeeUserName,
          availabilities: availabilitiesList, // 배열
        };

        console.log("sending payload:", JSON.stringify(payload, null, 2));
        const response = await addAvailability(payload);
        
        console.log("✅ 백엔드 저장 성공 응답:", JSON.stringify(response, null, 2));
        console.log("✅ 근무 가능 시간이 성공적으로 수정되었습니다.");
      } else {
        console.log("⚠️ 추가할 availability가 없습니다.");
      }
      
      alert("근무 가능 시간이 수정되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("근무 가능 시간 수정 실패:", error);
      console.error("에러 상세:", error.response?.data || error.message);
      alert("근무 가능 시간 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false); // 제출 완료 (성공/실패 무관)
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

