import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Toast from "../../../components/common/Toast.jsx";
import Modal from "../../../components/common/Modal.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import {
  fetchSchedules,
  requestSub,
} from "../../../services/employee/ScheduleService.js";

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

  useEffect(() => {
    setFormattedCurrentWeek(
      `${currentDate.format("YY")}.${currentDate.format("MM")} ${Math.ceil(
        currentDate.date() / 7,
      )}주차`,
    );
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
      await requestSub(eventData.id);
      setIsEventToastOpen(false);
      setIsMsgOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const MessageModal = ({ isOpen, message, onClose, duration = 1000 }) => {
    useEffect(() => {
      if (isOpen && duration) {
        const timer = setTimeout(() => {
          onClose?.();
        }, duration);
        return () => clearTimeout(timer);
      }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    return (
      <Modal xx={false}>
        <p className="py-5">{message}</p>
      </Modal>
    );
  };

  const Calendar = ({
    date,
    onEventClick,
    selectedEventProp,
    setSelectedEventProp,
  }) => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 8);
    const [week, setWeek] = useState([]);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const [events, setEvents] = useState([]);
    const colors = ["#68e194", "#32d1aa", "#00c1bd"];

    useEffect(() => {
      (async () => {
        try {
          let startOfWeek = dayjs(date).locale("ko").startOf("week");
          const weekArray = [];
          weekArray.push(
            ...Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")),
          );
          setWeek(weekArray);

          // const schedules = await fetchSchedules(
          //   startOfWeek.format("YYYY-MM-DD"),
          //   startOfWeek.add(6, "day").format("YYYY-MM-DD"),
          // );
          const schedules = [
            {
              id: 1,
              storeId: 1,
              storeName: "투썸플레이스 신촌점",
              startDatetime: "2025-10-23T10:00:00",
              endDatetime: "2025-10-23T13:00:00",
              shiftStatus: "SCHEDULED",
            },
            {
              id: 8,
              storeId: 1,
              storeName: "투썸플레이스 신촌점",
              startDatetime: "2025-10-24T19:00:00",
              endDatetime: "2025-10-24T23:00:00",
              shiftStatus: "SCHEDULED",
            },
          ];

          const formattedEvents = schedules.map((schedule) => ({
            id: schedule.id,
            storeId: schedule.storeId,
            storeName: schedule.storeName,
            start: schedule.startDatetime,
            end: schedule.endDatetime,
          }));

          setEvents(formattedEvents);
        } catch (error) {
          console.error("Error fetching schedules:", error);
        }
      })();
    }, [date]);

    const isFirstHour = (event, hour) => {
      if (!event) return false;
      const startHour = dayjs(event.start).hour();
      return hour === startHour;
    };

    const isLastHour = (event, hour) => {
      if (!event) return false;
      let endHour = dayjs(event.end).hour();
      if (endHour === 0) endHour = 24;
      return hour === endHour - 1;
    };

    const getEventForCell = (day, hour) => {
      return events.find((event) => {
        if (dayjs(event.start).format("YYYY-MM-DD") !== day) return false;
        const startHour = dayjs(event.start).hour();
        let endHour = dayjs(event.end).hour();
        if (endHour === 0) endHour = 24;
        return hour >= startHour && hour < endHour;
      });
    };

    const getColorIndex = (startHour) => {
      const totalHours = hours.length - 1;
      const segmentSize = Math.trunc(totalHours / colors.length);
      const normalizedHour = startHour - hours[0];
      return Math.min(
        colors.length - 1,
        Math.floor(normalizedHour / segmentSize),
      );
    };

    const getEventColor = (event) => {
      if (!event) return "white";
      const startHour = dayjs(event.start).hour();
      const colorIndex = getColorIndex(startHour);
      return colors[colorIndex];
    };

    return (
      <div className="flex flex-row w-full max-w-[362px] border-[0.5px] border-black rounded-[20px] bg-white overflow-x-hidden overflow-y-hidden">
        <div className="flex flex-col flex-shrink-0 w-[66px] ">
          <div className="flex flex-shrink-0 h-[30px] w-full" />
          <div className="flex flex-shrink-0 h-[30px] w-full border-t border-[#e7eaf3]" />
          {hours.map((hour) => (
            <div key={hour}>
              <div className="flex h-[35px] w-full items-center justify-center border-t border-[#e7eaf3]">
                {String(hour)}:00
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col flex-shrink-0 w-full h-full">
          <div className="flex flex-row flex-shrink-0 h-[30px]">
            {days.map((day) => (
              <div
                key={day}
                className="flex w-[42px] items-center justify-center border-l border-[#e7eaf3]"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="flex flex-row w-full">
            {week.map((w) => (
              <div
                key={w.format("DD")}
                className="flex flex-col w-[42px] h-full"
              >
                <div className="flex h-[30px] border-t border-l border-[#e7eaf3] justify-center items-center">
                  {w.format("DD")}
                </div>
                {hours.map((hour) => {
                  const event = getEventForCell(w.format("YYYY-MM-DD"), hour);
                  const isSelected =
                    selectedEventProp && selectedEventProp.id === event?.id;
                  const firstHour = isFirstHour(event, hour);
                  const lastHour = isLastHour(event, hour);
                  const isMiddleHour = (() => {
                    if (!event) return false;
                    const startHour = dayjs(event.start).hour();
                    let endHour = dayjs(event.end).hour();
                    if (endHour === 0) endHour = 24;
                    const middleHour = Math.floor(
                      (startHour + endHour - 1) / 2,
                    );
                    return hour === middleHour;
                  })();

                  return event ? (
                    <div
                      key={`${w.format("DD")}-${hour}`}
                      className={`flex h-[35px] border-l border-t border-[#e7eaf3] cursor-pointer
                        ${isSelected ? "border-x-2 border-x-black" : ""}
                  ${isSelected && firstHour ? "border-t-2 border-t-black" : ""}
                  ${isSelected && lastHour ? "border-b-2 border-b-black" : ""}`}
                      style={{
                        backgroundColor: getEventColor(event),
                        filter: isSelected ? "brightness(0.8)" : "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const clickedEvent = {
                          id: event.id,
                          storeId: event.storeId,
                          storeName: event.storeName,
                          start: event.start,
                          end: event.end,
                        };
                        setSelectedEventProp(clickedEvent);
                        onEventClick(clickedEvent);
                      }}
                    >
                      {isMiddleHour ? (
                        <span className="text-black text-[12px] font-[400]">
                          {event.storeName}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      key={`${w.format("DD")}-${hour}`}
                      className="flex h-[35px] border-l border-t border-[#e7eaf3]"
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center py-5">
      <div className="flex flex-row w-full justify-center items-center px-4 my-4">
        <div className="flex flex-row items-center justify-between">
          <LeftOutlined
            onClick={() => setCurrentDate(currentDate.subtract(7, "day"))}
          />
          <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] ">
            {formattedCurrentWeek}
          </p>
          <RightOutlined
            onClick={() => setCurrentDate(currentDate.add(7, "day"))}
          />
        </div>
      </div>
      <Calendar
        date={currentDate}
        onEventClick={handleEventClick}
        selectedEventProp={selectedCalendarEvent}
        setSelectedEventProp={setSelectedCalendarEvent}
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
              <p className="flex-shrink-0 h-[25px] border border-[#32d1aa] text-[12px] font-[400] rounded-[20px] shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] flex items-center justify-center px-2">
                {eventData.storeName}
              </p>
              <span className="text-[14px] font-[500]">
                {eventData.start.format("dd(DD) HH:mm-")}
                {eventData.end.format("HH:mm")}
              </span>
            </div>
            <GreenBtn
              className="text-[16px] font-[600] py-6 items-center relative"
              onClick={handleRequestSub}
            >
              요청하기
            </GreenBtn>
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
