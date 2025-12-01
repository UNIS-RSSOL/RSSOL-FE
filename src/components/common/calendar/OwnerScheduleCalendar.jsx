import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "dayjs/locale/ko";

function OwnerScheduleCalendar({
  date,
  onTimeSlotClick,
  selectedTimeSlots,
}) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22시
  const [week, setWeek] = useState([]);
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  useEffect(() => {
    let startOfWeek = dayjs(date).locale("ko").startOf("week");
    const weekArray = [];
    weekArray.push(
      ...Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")),
    );
    setWeek(weekArray);
  }, [date]);

  return (
    <div
      className={`flex flex-col w-[362px] h-[550px] border-[0.5px] border-black rounded-[20px] bg-white items-center overflow-x-hidden overflow-y-hidden`}
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
      <div className="flex-1 flex flex-col w-full">
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex flex-row w-full flex-1 border-t border-[#e7eaf3]"
          >
            <div className="flex-shrink-0 w-[52px] h-full items-center justify-center flex">
              <span className="text-[12px] font-[400]">{hour}시</span>
            </div>
            {week.map((w) => {
              const dayName = days[w.day()];
              const slotKey = `${w.format("YYYY-MM-DD")}-${dayName}-${hour}`;
              const isSelected = selectedTimeSlots?.has(slotKey) || false;

              return (
                <div
                  key={`${hour}-${w.format("DD")}`}
                  className="flex flex-shrink-0 w-[44px] h-full items-center justify-center border-l border-[#e7eaf3] cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "#4DD99F" : "transparent",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onTimeSlotClick) {
                      onTimeSlotClick(dayName, hour);
                    }
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OwnerScheduleCalendar;