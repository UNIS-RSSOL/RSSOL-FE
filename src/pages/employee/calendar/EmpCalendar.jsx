import { useState, useEffect } from "react";
import dayjs from "dayjs";
import MessageModal from "../../../components/MessageModal.jsx";
import Toast from "../../../components/Toast.jsx";
import Button from "../../../components/Button.jsx";
import RoundTag from "../../../components/RoundTag.jsx";
import LeftArrowIcon from "../../../assets/newicons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/newicons/RightArrowIcon.jsx";
import MyCalendar from "../../../components/common/calendar/MyCalendar.jsx";
import { getMyScheduleByPeriod } from "../../../services/new/WorkShiftService.js";
import { createShiftSwapRequest } from "../../../services/new/ShiftSwapService.js";

function EmpCalendar() {
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const [formattedCurrentWeek, setFormattedCurrentWeek] = useState(
    `${today.format("YY")}.${today.format("MM")} ${Math.ceil(today.date() / 7)}주차`,
  );
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [eventData, setEventData] = useState();
  const [isEventToastOpen, setIsEventToastOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    setFormattedCurrentWeek(
      `${currentDate.format("YY")}.${currentDate.format("MM")} ${Math.ceil(
        currentDate.date() / 7,
      )}주차`,
    );
    console.log(currentDate.startOf("week"), currentDate.endOf("week"));
    async () => {
      const response = await getMyScheduleByPeriod(
        currentDate.startOf("week").format("YYYY-MM-DD"),
        currentDate.endOf("week").format("YYYY-MM-DD"),
      );
      setSchedules(response);
    };
  }, [currentDate]);

  const handleEventClick = (e) => {
    setSelectedCalendarEvent(e);
    console.log(e);
    setEventData({
      id: e.id,
      storeId: e.storeId,
      storeName: e.storeName,
      start: dayjs(e.start),
      end: dayjs(e.end),
    });
    setIsEventToastOpen(true);
  };

  const handleRequestSub = async () => {
    try {
      await createShiftSwapRequest(eventData.id);
      setIsEventToastOpen(false);
      setIsMsgOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-5">
      <div className="flex flex-row w-full justify-center items-center px-4 my-4">
        <div className="flex flex-row items-center justify-between">
          <div
            className="cursor-pointer"
            onClick={() => setCurrentDate(currentDate.subtract(7, "day"))}
          >
            <LeftArrowIcon />
          </div>
          <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] ">
            {formattedCurrentWeek}
          </p>
          <div
            className="cursor-pointer"
            onClick={() => setCurrentDate(currentDate.add(7, "day"))}
          >
            <RightArrowIcon />
          </div>
        </div>
      </div>
      <MyCalendar
        date={currentDate}
        onEventClick={handleEventClick}
        selectedEventProp={selectedCalendarEvent}
        setSelectedEventProp={setSelectedCalendarEvent}
        schedule={[
          {
            id: 1,
            storeId: 1,
            storeName: "투썸플레이스 신촌점",
            startDatetime: "2026-01-23T10:00:00",
            endDatetime: "2026-01-23T13:00:00",
            shiftStatus: "SCHEDULED",
          },
          {
            id: 5,
            storeId: 1,
            storeName: "투썸플레이스 신촌점",
            startDatetime: "2026-01-23T10:00:00",
            endDatetime: "2026-01-23T13:00:00",
            shiftStatus: "SCHEDULED",
          },
          {
            id: 8,
            storeId: 1,
            storeName: "투썸플레이스 신촌점",
            startDatetime: "2026-01-24T09:00:00",
            endDatetime: "2026-01-24T13:00:00",
            shiftStatus: "SCHEDULED",
          },
        ]}
      />
      {isEventToastOpen && (
        <Toast
          isOpen={isEventToastOpen}
          onClose={() => setIsEventToastOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-center items-center gap-2">
              <p className="text-[16px] font-[600]">대타 요청하기</p>
              <p className="text-[12px] font-[400]">
                선택한 일정으로 대타를 요청할까요?
              </p>
            </div>
            <div className="flex flex-row items-center justify-center w-full gap-5">
              <RoundTag className="!text-[12px] !font-[400] !px-2 !py-[1.5px]">
                {eventData.storeName}
              </RoundTag>
              <span className="text-[14px] font-[500]">
                {eventData.start.format("dd(DD) HH:mm-")}
                {eventData.end.format("HH:mm")}
              </span>
            </div>
            <Button
              className="w-[361px] h-[48px] text-[16px] font-[600] items-center"
              onClick={handleRequestSub}
            >
              요청하기
            </Button>
          </div>
        </Toast>
      )}
      <MessageModal
        message="요청이 완료되었어요."
        isOpen={isMsgOpen}
        onClose={() => setIsMsgOpen(false)}
      />
    </div>
  );
}

export default EmpCalendar;
