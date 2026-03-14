import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import DayCalendar from "../../../components/calendar/DayCalendar.jsx";
import WeekCalendar from "../../../components/calendar/WeekCalendar.jsx";
import DateNavigation from "../../../components/common/DateNavigation.jsx";
import PillToggle from "../../../components/common/PillToggle.jsx";
import RoundTag from "../../../components/common/RoundTag.jsx";
import MessageModal from "../../../components/common/MessageModal.jsx";
import Toast from "../../../components/common/Toast.jsx";
import Button from "../../../components/common/Button.jsx";
import HomeHeader from "../../../components/home/HomeHeader.jsx";
import BellIcon from "../../../assets/icons/BellIcon.jsx";
import Footer from "../../../components/layout/footer/Footer.jsx";
import { getMyScheduleByPeriod } from "../../../services/WorkShiftService.js";
import { createShiftSwapRequest } from "../../../services/ShiftSwapService.js";
import { getActiveStore } from "../../../services/MypageService.js";

dayjs.locale("ko");

function EmpCalendar() {
  const navigate = useNavigate();
  const today = dayjs();
  const [selectedKey, setSelectedKey] = useState("1");
  const [currentDate, setCurrentDate] = useState(today);

  const formattedCurrentDate = currentDate.format("YYYY.MM.DD(dd)");
  const startOfWeek = currentDate.startOf("week");
  const formattedCurrentWeek = `${startOfWeek.format("YYYY.MM.DD")} - ${startOfWeek.add(6, "day").format("YYYY.MM.DD")}`;

  // 데이터 상태
  const [activeStoreName, setActiveStoreName] = useState("");
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [eventData, setEventData] = useState();
  const [dayWorkers, setDayWorkers] = useState([]);
  const [dayEvents, setDayEvents] = useState([]);
  const [weekWorkers, setWeekWorkers] = useState([]);
  const [weekEvents, setWeekEvents] = useState([]);

  // 모달/토스트 상태
  const [isEventToastOpen, setIsEventToastOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);

  // 활성 매장 로딩
  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStoreName(active.name);
      } catch (error) {
        console.error("활성 매장 조회 실패:", error);
      }
    })();
  }, []);

  // 일간: 내 스케줄 조회 → 매장별 데이터로 변환
  useEffect(() => {
    if (selectedKey !== "1") return;
    (async () => {
      try {
        const dateStr = currentDate.format("YYYY-MM-DD");
        const response = await getMyScheduleByPeriod(dateStr, dateStr);
        if (response && response.length > 0) {
          const uniqueStores = Array.from(
            new Map(
              response.map((s) => [
                s.storeId,
                { userStoreId: s.storeId, username: s.storeName },
              ]),
            ).values(),
          );
          setDayWorkers(uniqueStores);
          setDayEvents(
            response.map((s) => ({
              id: s.id,
              userStoreId: s.storeId,
              username: s.storeName,
              start: s.startDatetime,
              end: s.endDatetime,
            })),
          );
        }
      } catch (error) {
        console.error("일간 스케줄 조회 실패:", error);
      }
    })();
  }, [currentDate, selectedKey]);

  // 주간: 내 스케줄 조회 → 매장별 데이터로 변환
  useEffect(() => {
    if (selectedKey !== "2") return;
    (async () => {
      try {
        const weekStart = currentDate.startOf("week");
        const response = await getMyScheduleByPeriod(
          weekStart.format("YYYY-MM-DD"),
          weekStart.add(6, "day").format("YYYY-MM-DD"),
        );
        if (response && response.length > 0) {
          const uniqueStores = Array.from(
            new Map(
              response.map((s) => [
                s.storeId,
                { userStoreId: s.storeId, username: s.storeName },
              ]),
            ).values(),
          );
          setWeekWorkers(uniqueStores);
          setWeekEvents(
            response.map((s) => ({
              id: s.id,
              userStoreId: s.storeId,
              username: s.storeName,
              start: s.startDatetime,
              end: s.endDatetime,
            })),
          );
        }
      } catch (error) {
        console.error("주간 스케줄 조회 실패:", error);
      }
    })();
  }, [currentDate, selectedKey]);

  const handleViewChange = (key) => {
    setSelectedKey(key);
    setCurrentDate(today);
  };

  const handleEventClick = (e) => {
    setSelectedCalendarEvent(e);
    setEventData({
      id: e.id,
      storeName: e.username,
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
    <div className="w-full h-full flex flex-col bg-white font-Pretendard relative">
      <HomeHeader
        storeName={activeStoreName}
        onMenuClick={() => navigate("/employee")}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/employee/notification")}
      />

      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex-1 flex flex-col">
          {selectedKey === "1" ? (
            <div className="w-full h-full flex flex-col py-5 px-[16px]">
              <DateNavigation
                label={formattedCurrentDate}
                onPrev={() => setCurrentDate(currentDate.subtract(1, "day"))}
                onNext={() => setCurrentDate(currentDate.add(1, "day"))}
              />
              <DayCalendar
                className="flex-1"
                key={`day-${currentDate.format("YYYY-MM-DD")}`}
                date={currentDate}
                onEventClick={handleEventClick}
                selectedEventProp={selectedCalendarEvent}
                setSelectedEventProp={setSelectedCalendarEvent}
                externalWorkers={dayWorkers}
                externalEvents={dayEvents}
                hideLabels
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col py-5 px-[16px]">
              <DateNavigation
                label={formattedCurrentWeek}
                onPrev={() => setCurrentDate(currentDate.subtract(1, "week"))}
                onNext={() => setCurrentDate(currentDate.add(1, "week"))}
              />
              <WeekCalendar
                className="flex-1"
                key={`week-${currentDate.format("YYYY-MM-DD")}`}
                date={currentDate}
                onEventClick={handleEventClick}
                selectedEventProp={selectedCalendarEvent}
                setSelectedEventProp={setSelectedCalendarEvent}
                externalWorkers={weekWorkers}
                externalEvents={weekEvents}
              />
            </div>
          )}

          {/* 대타 요청 토스트 */}
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
                  className="w-full h-[48px] text-[16px] font-[600]"
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

      {/* 일간/주간 토글 + 추가 버튼 (네비바 위 플로팅) */}
      <div className="absolute bottom-[68px] left-0 w-full flex flex-row items-center justify-center px-4 pointer-events-none z-10">
        <div className="flex-1" />
        <div className="pointer-events-auto">
          <PillToggle
            tabs={[
              { key: "1", label: "일간" },
              { key: "2", label: "주간" },
            ]}
            activeKey={selectedKey}
            onChange={handleViewChange}
          />
        </div>
        <div className="flex-1 flex justify-end pointer-events-auto">
          <div className="w-[50px] h-[50px] rounded-full border-[1px] border-[#B3B3B3] bg-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="#87888C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EmpCalendar;
