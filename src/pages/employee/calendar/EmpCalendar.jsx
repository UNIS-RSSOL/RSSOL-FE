import WeekCalendar from "../../../components/common/calendar/WeekCalendar.jsx";
import PencilIcon from "../../../assets/icons/PencilIcon.jsx";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

function EmpCalendar() {
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const [formattedCurrentWeek, setFormattedCurrentWeek] = useState(
    `${today.format("YY")}.${today.format("MM")} ${Math.ceil(today.date() / 7)}주차`,
  );

  const Calendar = ({ date }) => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 8);
    const [week, setWeek] = useState([]);
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const [events, setEvents] = useState([
      {
        start: "2025-11-27 8:00",
        end: "2025-11-27 18:00",
      },
    ]);
    const colors = ["#68e194", "#32d1aa", "#00c1bd"];

    useEffect(() => {
      (async () => {
        try {
          let startOfWeek = dayjs(date).locale("ko").startOf("week");
          const weekArray = [];
          weekArray.push(
            ...Array.from({ length: 7 }, (_, i) =>
              startOfWeek.add(i, "day").format("DD"),
            ),
          );
          setWeek(weekArray);
          // const schedules = await fetchSchedules(
          //   date.format("YYYY-MM-DD"),
          //   date.format("YYYY-MM-DD"),
          // );
          // const uniqueWorkers = [
          //   ...new Set(schedules.map((schedule) => schedule.userStoreId)),
          // ];
          // const formattedEvents = schedules.map((schedule) => ({
          //   worker: schedule.userStoreId,
          //   start: schedule.startDatetime,
          //   end: schedule.endDatetime,
          // }));

          // setEvents(formattedEvents);
        } catch (error) {
          console.error("Error fetching schedules:", error);
        }
      })();
    }, [date]);

    const getEventForCell = (day, hour) => {
      return events.find((event) => {
        if (dayjs(event.start).format("DD") !== day) return false;
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
              <div className="flex w-[42px] items-center justify-center border-l border-[#e7eaf3]">
                {day}
              </div>
            ))}
          </div>
          <div className="flex flex-row w-full">
            {week.map((w) => (
              <div key={w} className="flex flex-col w-[42px] h-full">
                <div className="flex h-[30px] border-t border-l border-[#e7eaf3] justify-center items-center">
                  {w}
                </div>
                {hours.map((hour) => {
                  const event = getEventForCell(w, hour);
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
                      key={`${w}-${hour}`}
                      className="flex h-[35px] border-l border-t border-[#e7eaf3]"
                      style={{ backgroundColor: getEventColor(event) }}
                    >
                      {isMiddleHour ? (
                        <span className="text-black text-[12px] font-[400]"></span>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      key={`${w}-${hour}`}
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
            onClick={() => setCurrentDate(currentDate.subtract(1, "day"))}
          />
          <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] ">
            {formattedCurrentWeek}
          </p>
          <RightOutlined
            onClick={() => setCurrentDate(currentDate.add(1, "day"))}
          />
        </div>
      </div>
      <Calendar date={currentDate} />
    </div>
  );
}

export default EmpCalendar;
