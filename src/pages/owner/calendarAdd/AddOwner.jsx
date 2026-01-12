import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/alarm/TopBar.jsx";
import OwnerScheduleCalendar from "../../../components/common/calendar/OwnerScheduleCalendar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import Toast from "../../../components/common/Toast.jsx";
import {
  addWorkshift,
  fetchAllWorkers,
  fetchMyAvailabilities,
  updateAvailability,
} from "../../../services/owner/ScheduleService.js";
import { fetchSchedules } from "../../../services/common/ScheduleService.js";
import {
  fetchMydata,
  fetchStoredata,
  fetchActiveStore,
} from "../../../services/owner/MyPageService.js";

function AddOwner() {
  const navigate = useNavigate();
  const [currentDate] = useState(dayjs().locale("ko"));
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
  const [ownerUserId, setOwnerUserId] = useState(null);
  const [ownerStoreId, setOwnerStoreId] = useState(null);
  const [ownerUserName, setOwnerUserName] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [isLoadingOwnerInfo, setIsLoadingOwnerInfo] = useState(true);
  const [isLoadingAvailabilities, setIsLoadingAvailabilities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사장의 userId, storeId, userName 가져오기
  useEffect(() => {
    const loadOwnerInfo = async () => {
      setIsLoadingOwnerInfo(true);
      try {
        // 사장 정보 가져오기
        const mydata = await fetchMydata();
        console.log("owner fetchMydata 응답:", mydata);

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

        // 매장 정보 가져오기 (activeStore 우선)
        const activeStore = await fetchActiveStore();
        console.log("owner fetchActiveStore 응답:", activeStore);

        let storeId = null;
        if (activeStore && activeStore.storeId) {
          storeId = activeStore.storeId;
        } else if (activeStore && activeStore.id) {
          storeId = activeStore.id;
        }

        // activeStore에 없으면 fetchStoredata에서 가져오기
        if (!storeId) {
          const storedata = await fetchStoredata();
          console.log("owner fetchStoredata 응답:", storedata);

          if (storedata && storedata.storeId) {
            storeId = storedata.storeId;
          } else if (storedata && storedata.id) {
            storeId = storedata.id;
          }
        }

        if (userId && storeId && userName) {
          console.log("owner userId, storeId, userName 찾음:", { userId, storeId, userName });
          setOwnerUserId(userId);
          setOwnerStoreId(storeId);
          setOwnerUserName(userName);
        } else {
          console.error(
            "owner userId, storeId 또는 userName을 찾을 수 없습니다. userId:",
            userId,
            "storeId:",
            storeId,
            "userName:",
            userName,
          );
        }
      } catch (error) {
        console.error("사장 정보 로드 실패:", error);
        console.error("에러 상세:", error.response?.data || error.message);
      } finally {
        setIsLoadingOwnerInfo(false);
      }
    };
    loadOwnerInfo();
  }, []);

  // work availability 불러오기 및 초기 선택 상태 설정
  useEffect(() => {
    const loadAvailabilities = async () => {
      setIsLoadingAvailabilities(true);
      try {
        console.log("🔍 AddOwner: work availability 불러오기 시작");
        const availabilityData = await fetchMyAvailabilities();
        console.log("🔍 AddOwner: fetchMyAvailabilities 응답:", availabilityData);
        console.log("🔍 AddOwner: availability 개수:", availabilityData?.length || 0);
        
        // availability 데이터 구조 확인
        if (availabilityData && availabilityData.length > 0) {
          console.log("🔍 AddOwner: 첫 번째 availability 샘플:", availabilityData[0]);
          console.log("🔍 AddOwner: 모든 availability ID 목록:", availabilityData.map(a => a.id || 'NO_ID'));
        }
        
        setAvailabilities(availabilityData || []);

        // work availability를 selectedTimeSlots에 추가
        if (availabilityData && Array.isArray(availabilityData) && availabilityData.length > 0) {
          console.log("🔍 AddOwner: availability 데이터가 있음, selectedTimeSlots 설정 시작");
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
          console.log("🔍 AddOwner: selectedTimeSlots 설정 완료, 개수:", initialSelected.size);
          console.log("🔍 AddOwner: selectedTimeSlots 샘플:", Array.from(initialSelected).slice(0, 5));
        } else {
          console.log("🔍 AddOwner: availability 데이터가 없음");
        }
      } catch (error) {
        console.error("❌ AddOwner: work availability 로드 실패:", error);
        console.error("❌ AddOwner: 에러 상세:", error.response?.data || error.message);
      } finally {
        setIsLoadingAvailabilities(false);
      }
    };
    
    // ownerUserId와 ownerStoreId가 로드된 후에만 실행
    if (!isLoadingOwnerInfo && ownerUserId && ownerStoreId) {
      loadAvailabilities();
    }
  }, [currentDate, isLoadingOwnerInfo, ownerUserId, ownerStoreId]);

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

  // 드래그 선택 핸들러
  const handleDragSelect = (startDay, startHour, endDay, endHour) => {
    console.log("🔍 handleDragSelect 호출:", { startDay, startHour, endDay, endHour });
    
    const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    
    const startDayIndex = days.indexOf(startDay);
    const endDayIndex = days.indexOf(endDay);
    
    if (startDayIndex === -1 || endDayIndex === -1) {
      console.warn("⚠️ 잘못된 요일 인덱스:", { startDayIndex, endDayIndex });
      return;
    }
    
    const minDayIndex = Math.min(startDayIndex, endDayIndex);
    const maxDayIndex = Math.max(startDayIndex, endDayIndex);
    const minHour = Math.min(startHour, endHour);
    const maxHour = Math.max(startHour, endHour);
    
    console.log("🔍 드래그 범위:", { minDayIndex, maxDayIndex, minHour, maxHour });
    
    // 함수형 업데이트를 사용하여 최신 상태 보장
    setSelectedTimeSlots((prevSelected) => {
      const newSelected = new Set(prevSelected);
      const changedSlots = [];
      
      // 드래그 범위 내의 모든 칸을 토글
      for (let dayIndex = minDayIndex; dayIndex <= maxDayIndex; dayIndex++) {
        const targetDate = startOfWeek.add(dayIndex, "day");
        const dayName = days[dayIndex];
        
        for (let hour = minHour; hour <= maxHour; hour++) {
          const key = `${targetDate.format("YYYY-MM-DD")}-${dayName}-${hour}`;
          
          // 이미 선택된 칸은 해제, 선택되지 않은 칸은 선택
          if (newSelected.has(key)) {
            newSelected.delete(key);
            changedSlots.push({ key, action: "removed" });
          } else {
            newSelected.add(key);
            changedSlots.push({ key, action: "added" });
          }
        }
      }
      
      console.log("🔍 변경된 슬롯:", changedSlots.length, "개");
      console.log("🔍 새로운 선택 개수:", newSelected.size);
      
      return newSelected;
    });
  };

  // work availability 수정하기
  const handleAddSchedule = async () => {
    // 중복 실행 방지
    if (isSubmitting) {
      console.warn("⚠️ 이미 처리 중입니다. 중복 요청을 무시합니다.");
      return;
    }

    if (isLoadingOwnerInfo || isLoadingAvailabilities) {
      alert("정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!ownerUserId || !ownerStoreId || !ownerUserName) {
      console.error(
        "ownerUserId, ownerStoreId 또는 ownerUserName이 null입니다. userId:",
        ownerUserId,
        "storeId:",
        ownerStoreId,
        "userName:",
        ownerUserName,
      );
      alert("사장 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true); // 제출 시작

    const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
    const days = ["일", "월", "화", "수", "목", "금", "토"];

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

    // 변경 사항이 있는지 확인
    // 기존 availability를 dayOfWeek, startTime, endTime 기준으로 정규화하여 비교
    const normalizeAvailability = (avail) => {
      if (avail.dayOfWeek && avail.startTime && avail.endTime) {
        return `${avail.dayOfWeek}-${avail.startTime}-${avail.endTime}`;
      }
      return null;
    };

    // 기존 availability 정규화
    const existingAvailabilitiesNormalized = new Set(
      availabilities
        .map(normalizeAvailability)
        .filter(Boolean)
    );

    // 새로운 availability 정규화
    const newAvailabilitiesNormalized = new Set(
      availabilitiesList.map(normalizeAvailability).filter(Boolean)
    );

    // 변경 사항이 있는지 확인
    const hasChanges = 
      existingAvailabilitiesNormalized.size !== newAvailabilitiesNormalized.size ||
      Array.from(existingAvailabilitiesNormalized).some(
        (key) => !newAvailabilitiesNormalized.has(key)
      ) ||
      Array.from(newAvailabilitiesNormalized).some(
        (key) => !existingAvailabilitiesNormalized.has(key)
      );

    if (!hasChanges) {
      alert("변경된 내용이 없습니다.");
      setIsSubmitting(false);
      return;
    }

    // work availability 수정 (PUT 전체 갱신 방식)
    try {
      // PUT 요청 시 id를 모두 제거하고 새 항목만 보내기 (백엔드가 id 있으면 UPDATE, 없으면 INSERT로 처리하므로)
      const availabilitiesWithoutId = availabilitiesList.map(({ id, ...rest }) => rest);
      
      // PUT 요청을 위한 payload 생성 (백엔드 DTO 구조에 맞게)
      const payload = {
        userStoreId: ownerStoreId,
        userName: ownerUserName,
        availabilities: availabilitiesWithoutId, // id 없는 순수 배열 (전체 INSERT로 처리)
      };

      console.log("🔍 PUT 요청으로 전체 갱신 중...");
      console.log("🔍 payload:", JSON.stringify(payload, null, 2));
      
      const response = await updateAvailability(payload);
      
      console.log("✅ 백엔드 저장 성공 응답:", JSON.stringify(response, null, 2));
      console.log("✅ 근무 가능 시간이 성공적으로 수정되었습니다.");
      
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate("/scheduleList");
      }, 2000);
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
        <div className="text-lg font-semibold">내 스케줄 추가</div>

        <div className="flex justify-center">
          <OwnerScheduleCalendar
            date={currentDate}
            onDragSelect={handleDragSelect}
            selectedTimeSlots={selectedTimeSlots}
          />
        </div>
      </div>

      <BottomBar
        singleButton
        singleButtonText="스케줄 추가하기"
        onSingleClick={handleAddSchedule}
      />

      <Toast isOpen={toastOpen} onClose={() => setToastOpen(false)}>
        <p className="text-lg font-bold">완료되었습니다</p>
      </Toast>
    </div>
  );
}

export default AddOwner;
