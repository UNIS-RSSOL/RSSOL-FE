import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "dayjs/locale/ko";
import { fetchSchedules } from "../../../services/common/ScheduleService.js";

function WeekCalendar({ date }) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const [week, setWeek] = useState([]);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const [workers, setWorkers] = useState([
    { id: 1, name: "지민" },
    { id: 2, name: "수진" },
  ]);
  const [events, setEvents] = useState([
    {
      id: 1,
      workerId: 1,
      workerName: "지민",
      start: "2025-11-30T15:00",
      end: "2025-11-30T18:00",
    },
    {
      id: 2,
      workerId: 2,
      workerName: "수진",
      start: "2025-12-01T13:00",
      end: "2025-12-01T18:00",
    },
  ]);
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];

  useEffect(() => {
    (async () => {
      let startOfWeek = dayjs(date).locale("ko").startOf("week");
      const weekArray = [];
      weekArray.push(
        ...Array.from({ length: 7 }, (_, i) =>
          startOfWeek.add(i, "day").format("DD"),
        ),
      );
      setWeek(weekArray);

      const schedules = await fetchSchedules(
        startOfWeek.format("YYYY-MM-DD"),
        startOfWeek.add(6, "day").format("YYYY-MM-DD"),
      );
      const uniqueWorkers = [
        ...new Set(
          schedules.map((schedule) => ({
            id: schedule.userStoreId,
            name: schedule.userName,
          })),
        ),
      ];
      const formattedEvents = schedules.map((schedule) => ({
        id: schedule.id,
        workerId: schedule.userStoreId,
        worker: schedule.userName,
        start: schedule.startDatetime,
        end: schedule.endDatetime,
      }));

      // setWorkers(uniqueWorkers);
      // setEvents(formattedEvents);
    })();
  }, [date]);

  const getEventForCell = (workerId, day) => {
    return events.find((event) => {
      if (event.workerId !== workerId) return false;
      const date = dayjs(event.start).format("DD");
      return day === date;
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

  return (
    <div
      className={`flex flex-col w-[362px] h-[550px] border-[0.5px] border-black rounded-[20px] bg-white items-center overflow-x-hidden ${workers.length < 8 ? "overflow-y-hidden" : "overflow-y-auto"}`}
    >
      <div className="flex flex-shrink-0 flex-row w-full h-[35px]">
        <div className="flex-shrink-0 w-[52px] h-full" />
        {days.map((day) => (
          <div key={day}>
            <div className="flex-shrink-0 flex w-[44px] h-full items-center justify-center border-l border-[#e7eaf3]">
              {day}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-shrink-0 flex-row w-full h-[35px] border-t border-[#e7eaf3]">
        <div className="flex-shrink-0 w-[52px] h-full" />
        {week.map((w) => (
          <div
            key={w}
            className="flex-shrink-0 flex w-[44px] h-full items-center justify-center border-l border-[#e7eaf3]"
          >
            {w}
          </div>
        ))}
      </div>
      {workers.map((worker) => (
        <div
          key={worker.id}
          className="flex flex-shrink-0 flex-row w-full h-[60px] border-t border-[#e7eaf3]"
        >
          <div className="flex flex-shrink-0 w-[52px] h-full items-center justify-center">
            {worker.name}
          </div>
          {week.map((w) => {
            const event = getEventForCell(worker.id, w);

            return event ? (
              <div
                key={`${worker.id}-${w}`}
                className="flex flex-col flex-shrink-0 w-[44px] h-full items-center justify-center border-l border-[#e7eaf3]"
                style={{
                  backgroundColor:
                    colors[getColorIndex(dayjs(event.start).hour())],
                }}
              >
                <span className="text-[12px]/[16px] font-[400]">
                  {dayjs(event.start).format("HH:mm")}
                </span>
                <span className="h-[5px] w-[1px] bg-black my-[2px]" />
                <span className="text-[12px]/[16px] font-[400]">
                  {dayjs(event.end).format("HH:mm")}
                </span>
              </div>
            ) : (
              <div
                key={`${worker.id}-${w}`}
                className="flex flex-shrink-0 w-[44px] h-full items-center justify-center border-l border-[#e7eaf3]"
              ></div>
            );
          })}
        </div>
      ))}
      {workers.length < 8 && (
        <div className="flex flex-shrink-0 flex-row w-full h-full border-t border-[#e7eaf3]">
          <div className="flex-shrink-0 w-[52px] h-full " />
          {week.map((w) => (
            <div
              key={w}
              className="flex flex-shrink-0 w-[44px] h-full border-l border-[#e7eaf3]"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default WeekCalendar;
