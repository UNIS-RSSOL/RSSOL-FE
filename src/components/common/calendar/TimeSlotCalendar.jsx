import React from "react";

function TimeSlotCalendar({ onTimeSlotClick, getAvailabilityCount }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22시
  const days = ["일", "월", "화", "수", "목", "금", "토"];

  const getCellStyle = (day, hour) => {
    if (!getAvailabilityCount) return {};

    const count = getAvailabilityCount(day, hour);
    if (!count || count <= 0) return {};

    // 인원 수에 따라 색 농도 단계 조절 (최대 4단계로 클램프)
    const level = Math.min(count, 4);
    // 가장 진한 색 #68E194 (104, 225, 148) 기준으로 단계별로 더 연하게
    // 레벨 4가 가장 진함 (alpha 1.0), 레벨 1이 가장 연함 (alpha 0.25)
    const alpha = 0.25 + (level / 4) * 0.75;

    return {
      backgroundColor: `rgba(104, 225, 148, ${alpha})`,
      transition: "background-color 0.15s ease-out",
    };
  };

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
            {days.map((day) => (
              <div
                key={`${hour}-${day}`}
                className="flex flex-shrink-0 w-[44px] h-full items-center justify-center border-l border-[#e7eaf3] cursor-pointer hover:bg-gray-50"
                style={getCellStyle(day, hour)}
                onClick={() => onTimeSlotClick?.(day, hour)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeSlotCalendar;

