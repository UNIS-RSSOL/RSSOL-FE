import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import MessageModal from "../../../components/common/MessageModal.jsx";
import Toast from "../../../components/common/Toast.jsx";
import Button from "../../../components/common/Button.jsx";
import RoundTag from "../../../components/common/RoundTag.jsx";
import DateNavigation from "../../../components/common/DateNavigation.jsx";
import MyCalendar from "../../../components/calendar/MyCalendar.jsx";
import HomeHeader from "../../../components/home/HomeHeader.jsx";
import BellIcon from "../../../assets/icons/BellIcon.jsx";
import BottomNav from "../../../components/layout/BottomNav.jsx";
import { getMyScheduleByPeriod } from "../../../services/WorkShiftService.js";
import { createShiftSwapRequest } from "../../../services/ShiftSwapService.js";
import { getActiveStore } from "../../../services/MypageService.js";

function EmpCalendar() {
  const navigate = useNavigate();
  const today = dayjs();
  const [activeStoreName, setActiveStoreName] = useState("");
  const [currentDate, setCurrentDate] = useState(today);
  const formattedCurrentWeek = `${currentDate.format("YY")}.${currentDate.format("MM")} ${Math.ceil(currentDate.date() / 7)}주차`;
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [eventData, setEventData] = useState();
  const [isEventToastOpen, setIsEventToastOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStoreName(active.name);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await getMyScheduleByPeriod(
          currentDate.startOf("week").format("YYYY-MM-DD"),
          currentDate.endOf("week").format("YYYY-MM-DD"),
        );
        setSchedules(response);
      } catch (error) {
        console.error("내 스케줄 조회 실패:", error);
      }
    })();
  }, [currentDate]);

  const handleEventClick = (e) => {
    setSelectedCalendarEvent(e);
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
      console.error("대타 요청 실패:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      <HomeHeader
        storeName={activeStoreName}
        onMenuClick={() => navigate("/employee")}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/employee/notification")}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full flex flex-col items-center py-5">
          <div className="my-4">
            <DateNavigation
              label={formattedCurrentWeek}
              onPrev={() => setCurrentDate(currentDate.subtract(7, "day"))}
              onNext={() => setCurrentDate(currentDate.add(7, "day"))}
            />
          </div>
          <MyCalendar
            date={currentDate}
            onEventClick={handleEventClick}
            selectedEventProp={selectedCalendarEvent}
            setSelectedEventProp={setSelectedCalendarEvent}
            schedule={schedules}
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
      </main>

      <BottomNav role="employee" activePage="calendar" />
    </div>
  );
}

export default EmpCalendar;
