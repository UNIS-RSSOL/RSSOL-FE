import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { fetchSchedules } from "../../../services/common/ScheduleService.js";

function DayCalendar({
  date,
  onEventClick,
  selectedEventProp,
  setSelectedEventProp,
  storeId,
}) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 8);
  const [blank, setBlank] = useState(Array.from({ length: 7 }, () => "."));
  const [workers, setWorkers] = useState();
  const [events, setEvents] = useState();
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];

  useEffect(() => {
    (async () => {
      try {
        const schedules = await fetchSchedules(
          date.format("YYYY-MM-DD"),
          date.format("YYYY-MM-DD"),
          storeId,
        );

        const uniqueWorkers = Array.from(
          new Map(
            schedules.map((schedule) => [
              `${schedule.userStoreId}-${schedule.userId}`, // Combine both IDs for uniqueness
              {
                userStoreId: schedule.userStoreId,
                username: schedule.username,
              },
            ]),
          ).values(),
        );
        const formattedEvents = schedules.map((schedule) => ({
          id: schedule.id,
          userStoreId: schedule.userStoreId,
          username: schedule.username,
          start: schedule.startDatetime,
          end: schedule.endDatetime,
        }));

        setWorkers(uniqueWorkers);
        setEvents(formattedEvents);

        const len = uniqueWorkers?.length || 0;
        const newBlank = Array.from(
          { length: Math.max(0, 7 - len) },
          () => ".",
        );
        setBlank(newBlank);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    })();
  }, [date, storeId]);

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

  const getEventForCell = (userStoreId, hour) => {
    return events.find((event) => {
      if (event.userStoreId !== userStoreId) return false;
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
    <div className="flex flex-row w-full h-[596px] max-w-[362px] border-[0.5px] border-black rounded-[20px] bg-white items-center overflow-x-auto overflow-y-hidden">
      <div className="flex-shrink-0 flex-col w-[66px]">
        <div className="h-[30px] flex-shrink-0" />
        {hours.map((hour) => (
          <div key={hour}>
            <div className="flex flex-shrink-0 h-[35px] items-center justify-center border-t border-[#e7eaf3]">
              {String(hour)}:00
            </div>
          </div>
        ))}
      </div>
      {workers?.map((worker) => (
        <div
          key={worker.userStoreId}
          className="flex flex-shrink-0 flex-col w-[42px] border-l border-[#e7eaf3]"
        >
          <div className="flex flex-shrink-0 h-[30px]" />

          {hours.map((hour) => {
            const event = getEventForCell(worker.userStoreId, hour);
            const isSelected =
              selectedEventProp &&
              selectedEventProp.id === event?.id &&
              selectedEventProp.userStoreId === worker.userStoreId &&
              selectedEventProp.start === event?.start &&
              selectedEventProp.end === event?.end;
            const firstHour = isFirstHour(event, hour);
            const lastHour = isLastHour(event, hour);
            const isMiddleHour = (() => {
              if (!event) return false;
              const startHour = dayjs(event.start).hour();
              let endHour = dayjs(event.end).hour();
              if (endHour === 0) endHour = 24;
              const middleHour = Math.floor((startHour + endHour - 1) / 2);
              return hour === middleHour;
            })();

            return event ? (
              <div
                key={`${worker.userStoreId}-${hour}`}
                className={`flex h-[35px] items-center justify-center border-t border-[#e7eaf3] cursor-pointer 
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
                    userStoreId: event.userStoreId,
                    username: event.username,
                    start: event.start,
                    end: event.end,
                  };
                  setSelectedEventProp(clickedEvent);
                  onEventClick(clickedEvent);
                }}
              >
                {isMiddleHour ? (
                  <span className="text-black text-[12px] font-[400]">
                    {worker.username}
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                key={`${worker.userStoreId}-${hour}`}
                className="flex h-[35px] border-t border-[#e7eaf3] bg-white"
              />
            );
          })}
        </div>
      ))}
      {blank &&
        blank.map((_, index) => (
          <div
            key={`blank-${index}`}
            className={`flex-shrink-0 flex-col w-[42px] border-l border-[#e7eaf3] last:border-r-0 ${index === 0 ? "border-l" : ""}`}
          >
            <div className="h-[30px] " />
            {hours.map((hour) => (
              <div key={hour}>
                <div className="flex h-[35px] items-center justify-center border-t border-[#e7eaf3]" />
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default DayCalendar;
