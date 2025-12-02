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
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [toastOpen, setToastOpen] = useState(false);

  // 사장의 userId와 storeId 가져오기
  useEffect(() => {
    const loadOwnerInfo = async () => {
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

        if (userId && storeId) {
          console.log("owner userId와 storeId 찾음:", { userId, storeId });
          setOwnerUserId(userId);
          setOwnerStoreId(storeId);
        } else {
          console.error(
            "owner userId 또는 storeId를 찾을 수 없습니다. userId:",
            userId,
            "storeId:",
            storeId,
          );
        }
      } catch (error) {
        console.error("사장 정보 로드 실패:", error);
      }
    };
    loadOwnerInfo();
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

    if (!ownerUserId || !ownerStoreId) {
      console.error(
        "ownerUserId 또는 ownerStoreId가 null입니다. userId:",
        ownerUserId,
        "storeId:",
        ownerStoreId,
      );
      alert("사장 정보를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.");
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
        if (ownerUserId && schedule.userId && schedule.userId !== ownerUserId) {
          return false;
        }
        // userStoreId로 중복 확인 (기존 호환성을 위해)
        if (
          ownerUserId &&
          schedule.userStoreId &&
          schedule.userStoreId !== ownerUserId
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

    // 스케줄 추가
    try {
      for (const schedule of schedulesToAdd) {
        await addWorkshift(
          ownerUserId,
          ownerStoreId,
          schedule.start,
          schedule.end,
        );
      }
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate("/scheduleList");
      }, 2000);
    } catch (error) {
      console.error("스케줄 추가 실패:", error);
      alert("스케줄 추가에 실패했습니다. 다시 시도해주세요.");
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

      <Toast isOpen={toastOpen} onClose={() => setToastOpen(false)}>
        <p className="text-lg font-bold">완료되었습니다</p>
      </Toast>
    </div>
  );
}

export default AddOwner;
