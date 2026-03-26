import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import OwnerScheduleCalendar from "../../../components/calendar/OwnerScheduleCalendar.jsx";
import BottomBar from "../../../components/layout/footer/BottomBar.jsx";
import Toast from "../../../components/common/Toast.jsx";
import {
  getMyWorkAvailability,
  updateMyWorkAvailability,
} from "../../../services/WorkAvailabilityService.js";
import { getScheduleByPeriod } from "../../../services/WorkShiftService.js";
import {
  getOwnerProfile,
  getOwnerStore,
  getActiveStore,
} from "../../../services/MypageService.js";

function OwnerSchedule() {
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
        const mydata = await getOwnerProfile();
        console.log("owner getOwnerProfile 응답:", mydata);

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
        const activeStore = await getActiveStore();
        console.log("owner getActiveStore 응답:", activeStore);

        let storeId = null;
        if (activeStore && activeStore.storeId) {
          storeId = activeStore.storeId;
        } else if (activeStore && activeStore.id) {
          storeId = activeStore.id;
        }

        // activeStore에 없으면 getOwnerStore에서 가져오기
        if (!storeId) {
          const storedata = await getOwnerStore();
          console.log("owner getOwnerStore 응답:", storedata);

          if (storedata && storedata.storeId) {
            storeId = storedata.storeId;
          } else if (storedata && storedata.id) {
            storeId = storedata.id;
          }
        }

        if (userId && storeId && userName) {
          console.log("owner userId, storeId, userName 찾음:", {
            userId,
            storeId,
            userName,
          });
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
        const availabilityData = await getMyWorkAvailability();
        // 백엔드 응답이 { availabilities: [...] } (객체) 이거나 [...] (배열) 일 수 있어 항상 배열로 정규화
        const list = Array.isArray(availabilityData)
          ? availabilityData
          : availabilityData?.availabilities || [];
        console.log(
          "🔍 AddOwner: getMyWorkAvailability 응답:",
          availabilityData,
        );
        console.log(
          "🔍 AddOwner: availability 개수:",
          list.length || 0,
        );

        // availability 데이터 구조 확인
        if (list.length > 0) {
          console.log(
            "🔍 AddOwner: 첫 번째 availability 샘플:",
            list[0],
          );
          console.log(
            "🔍 AddOwner: 모든 availability ID 목록:",
            list.map((a) => a.id || "NO_ID"),
          );
        }

        setAvailabilities(list);

        // work availability를 selectedTimeSlots에 추가
        if (list.length > 0) {
          console.log(
            "🔍 AddOwner: availability 데이터가 있음, selectedTimeSlots 설정 시작",
          );
          const days = ["일", "월", "화", "수", "목", "금", "토"];
          const initialSelected = new Set();
          const startOfWeek = dayjs(currentDate).locale("ko").startOf("week");
          const endOfWeek = startOfWeek.add(6, "day").endOf("day");

          list.forEach((availability) => {
            // availability 데이터 구조 확인: startDatetime/endDatetime 또는 dayOfWeek/startTime/endTime
            let availabilityStart, availabilityEnd;

            if (availability.startDatetime && availability.endDatetime) {
              // 특정 날짜/시간 형식
              availabilityStart = dayjs(availability.startDatetime);
              availabilityEnd = dayjs(availability.endDatetime);
            } else if (
              availability.dayOfWeek &&
              availability.startTime &&
              availability.endTime
            ) {
              // 주기적 패턴 형식 (dayOfWeek, startTime, endTime)
              // 현재 주의 해당 요일 찾기
              const dayMap = {
                SUN: 0,
                MON: 1,
                TUE: 2,
                WED: 3,
                THU: 4,
                FRI: 5,
                SAT: 6,
              };
              const targetDayIndex =
                dayMap[availability.dayOfWeek.toUpperCase()];

              if (targetDayIndex === undefined) {
                console.warn("⚠️ 알 수 없는 요일:", availability.dayOfWeek);
                return;
              }

              // 현재 주의 해당 요일 찾기
              const targetDate = startOfWeek.add(targetDayIndex, "day");

              // startTime과 endTime을 파싱 (HH:mm 형식)
              const [startHour, startMinute] = availability.startTime
                .split(":")
                .map(Number);
              const [endHour, endMinute] = availability.endTime
                .split(":")
                .map(Number);

              console.log("🔍 availability 시간 파싱:", {
                dayOfWeek: availability.dayOfWeek,
                startTime: availability.startTime,
                endTime: availability.endTime,
                startHour,
                startMinute,
                endHour,
                endMinute,
              });

              availabilityStart = targetDate
                .hour(startHour)
                .minute(startMinute || 0)
                .second(0);
              // endTime이 "22:00"이면 22시까지 포함해야 하므로, endHour를 그대로 사용
              availabilityEnd = targetDate
                .hour(endHour)
                .minute(endMinute || 0)
                .second(0);
            } else {
              console.warn("⚠️ 알 수 없는 availability 형식:", availability);
              return;
            }

            // 현재 주의 범위 내에 있는 availability만 표시
            if (
              availabilityStart.isAfter(endOfWeek) ||
              availabilityEnd.isBefore(startOfWeek)
            ) {
              return;
            }

            // 겹치는 날짜 범위 계산
            const overlapStartDate = availabilityStart.isAfter(startOfWeek)
              ? availabilityStart
              : startOfWeek;
            const overlapEndDate = availabilityEnd.isBefore(endOfWeek)
              ? availabilityEnd
              : endOfWeek;

            // 겹치는 날짜들에 대해 시간 슬롯 추가
            let currentDate = overlapStartDate.startOf("day");
            while (
              currentDate.isBefore(overlapEndDate) ||
              currentDate.isSame(overlapEndDate, "day")
            ) {
              const dayName = days[currentDate.day()];
              const dayStart = currentDate.startOf("day");
              const dayEnd = currentDate.endOf("day");

              // 이 날짜에 availability가 겹치는지 확인
              if (
                availabilityStart.isBefore(dayEnd) &&
                availabilityEnd.isAfter(dayStart)
              ) {
                // 이 날짜에서 겹치는 시간 범위 계산
                const dayOverlapStart = availabilityStart.isAfter(dayStart)
                  ? availabilityStart
                  : dayStart;
                const dayOverlapEnd = availabilityEnd.isBefore(dayEnd)
                  ? availabilityEnd
                  : dayEnd;

                // 시간 단위로 슬롯 추가
                let currentHour = dayOverlapStart.hour();
                const endHour = dayOverlapEnd.hour();
                const endMinute = dayOverlapEnd.minute();

                // endTime이 정확히 시간 단위(분이 0)이고 endHour가 22시라면 포함
                // 예: "22:00"이면 22시까지 포함해야 함
                // 예: "10:00"이면 10시는 포함하지 않음 (9시까지만)
                const shouldIncludeEndHour =
                  endMinute > 0 || (endMinute === 0 && endHour === 22); // 22:00은 포함

                const finalEndHour = shouldIncludeEndHour
                  ? endHour
                  : endHour - 1;

                console.log("🔍 시간 슬롯 추가:", {
                  dayName,
                  date: currentDate.format("YYYY-MM-DD"),
                  currentHour,
                  endHour,
                  endMinute,
                  shouldIncludeEndHour,
                  finalEndHour,
                });

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
          console.log(
            "🔍 AddOwner: selectedTimeSlots 설정 완료, 개수:",
            initialSelected.size,
          );
          console.log(
            "🔍 AddOwner: selectedTimeSlots 샘플:",
            Array.from(initialSelected).slice(0, 5),
          );
        } else {
          console.log("🔍 AddOwner: availability 데이터가 없음");
        }
      } catch (error) {
        console.error("❌ AddOwner: work availability 로드 실패:", error);
        console.error(
          "❌ AddOwner: 에러 상세:",
          error.response?.data || error.message,
        );
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
        const schedules = await getScheduleByPeriod(
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
    console.log("🔍 handleDragSelect 호출:", {
      startDay,
      startHour,
      endDay,
      endHour,
    });

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

    console.log("🔍 드래그 범위:", {
      minDayIndex,
      maxDayIndex,
      minHour,
      maxHour,
    });

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
    // 요일별로 그룹화하여 각 요일의 모든 시간대를 합침
    const schedulesByDayOfWeek = {};
    const sortedSlots = Array.from(selectedTimeSlots).sort();

    console.log("🔍 선택된 시간 슬롯 개수:", sortedSlots.length);

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
        const dayOfWeek = getDayOfWeek(startDatetime);

        // 요일별로 그룹화
        if (!schedulesByDayOfWeek[dayOfWeek]) {
          schedulesByDayOfWeek[dayOfWeek] = [];
        }
        schedulesByDayOfWeek[dayOfWeek].push({
          start: startDatetime,
          end: endDatetime,
        });
      });
    }

    console.log("🔍 요일별 그룹화 결과:", Object.keys(schedulesByDayOfWeek));

    // 각 요일별로 모든 시간대를 합쳐서 하나의 availability 생성
    const availabilitiesList = [];
    Object.keys(schedulesByDayOfWeek).forEach((dayOfWeek) => {
      const daySchedules = schedulesByDayOfWeek[dayOfWeek];

      // 시간순으로 정렬
      daySchedules.sort((a, b) => a.start.diff(b.start));

      // 같은 요일의 모든 시간대를 하나로 합침
      let currentGroup = null;
      daySchedules.forEach((schedule) => {
        if (!currentGroup) {
          currentGroup = {
            start: schedule.start,
            end: schedule.end,
          };
        } else {
          // 연속된 시간대인지 확인 (끝 시간과 시작 시간이 같거나 겹침)
          if (
            currentGroup.end.isSame(schedule.start) ||
            currentGroup.end.isBefore(schedule.start)
          ) {
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

    console.log("🔍 생성된 availabilities:", availabilitiesList);

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
      availabilities.map(normalizeAvailability).filter(Boolean),
    );

    // 새로운 availability 정규화
    const newAvailabilitiesNormalized = new Set(
      availabilitiesList.map(normalizeAvailability).filter(Boolean),
    );

    // 변경 사항이 있는지 확인
    const hasChanges =
      existingAvailabilitiesNormalized.size !==
        newAvailabilitiesNormalized.size ||
      Array.from(existingAvailabilitiesNormalized).some(
        (key) => !newAvailabilitiesNormalized.has(key),
      ) ||
      Array.from(newAvailabilitiesNormalized).some(
        (key) => !existingAvailabilitiesNormalized.has(key),
      );

    if (!hasChanges) {
      alert("변경된 내용이 없습니다.");
      setIsSubmitting(false);
      return;
    }

    // work availability 수정 (PUT 전체 갱신 방식)
    try {
      // PUT 요청 시 id를 모두 제거하고 새 항목만 보내기 (백엔드가 id 있으면 UPDATE, 없으면 INSERT로 처리하므로)
      const availabilitiesWithoutId = availabilitiesList.map(
        ({ id, ...rest }) => rest,
      );

      // PUT 요청을 위한 payload 생성 (백엔드 DTO 구조에 맞게)
      // API는 { availabilities: [...] } 형태만 받음
      const payload = {
        availabilities: availabilitiesWithoutId, // id 없는 순수 배열
      };

      console.log("🔍 PUT 요청으로 전체 갱신 중...");
      console.log("🔍 payload:", JSON.stringify(payload, null, 2));
      console.log("🔍 payload 상세:", {
        userStoreId: ownerStoreId,
        userName: ownerUserName,
        availabilitiesCount: payload.availabilities.length,
        availabilities: payload.availabilities,
      });

      const response = await updateMyWorkAvailability(payload.availabilities);

      console.log(
        "✅ 백엔드 저장 성공 응답:",
        JSON.stringify(response, null, 2),
      );
      console.log("✅ 응답 타입:", typeof response);
      console.log("✅ 응답이 배열인가?", Array.isArray(response));
      if (Array.isArray(response)) {
        console.log("✅ 응답 배열 길이:", response.length);
        console.log("✅ 응답 배열 첫 번째 항목:", response[0]);
      }
      console.log("✅ 근무 가능 시간이 성공적으로 수정되었습니다.");

      // 저장 후 최신 데이터 다시 불러오기
      try {
        const updatedAvailabilityData = await getMyWorkAvailability();
        console.log("🔍 저장 후 최신 데이터:", updatedAvailabilityData);
        const updatedList = Array.isArray(updatedAvailabilityData)
          ? updatedAvailabilityData
          : updatedAvailabilityData?.availabilities || [];
        setAvailabilities(updatedList);
      } catch (refreshError) {
        console.warn("⚠️ 저장 후 데이터 새로고침 실패:", refreshError);
        // 새로고침 실패해도 계속 진행
      }

      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        navigate("/owner/schedule/list");
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
      <div className="h-[60px] shrink-0" />

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

export default OwnerSchedule;
