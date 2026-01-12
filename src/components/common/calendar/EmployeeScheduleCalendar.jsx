import dayjs from "dayjs";
import { useEffect, useState, useRef } from "react";
import "dayjs/locale/ko";

function EmployeeScheduleCalendar({
  date,
  onTimeSlotClick,
  selectedTimeSlots,
  onDragSelect,
}) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22시
  const [week, setWeek] = useState([]);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const dragStartRef = useRef(null);
  const dragEndRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    let startOfWeek = dayjs(date).locale("ko").startOf("week");
    const weekArray = [];
    weekArray.push(
      ...Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")),
    );
    setWeek(weekArray);
  }, [date]);

  // 드래그 범위 내의 모든 슬롯 키 생성
  const getSlotsInRange = (startDay, startHour, endDay, endHour) => {
    const startOfWeek = dayjs(date).locale("ko").startOf("week");
    const slots = [];
    
    const startDayIndex = days.indexOf(startDay);
    const endDayIndex = days.indexOf(endDay);
    
    const minDayIndex = Math.min(startDayIndex, endDayIndex);
    const maxDayIndex = Math.max(startDayIndex, endDayIndex);
    const minHour = Math.min(startHour, endHour);
    const maxHour = Math.max(startHour, endHour);
    
    for (let dayIndex = minDayIndex; dayIndex <= maxDayIndex; dayIndex++) {
      const targetDate = startOfWeek.add(dayIndex, "day");
      const dayName = days[dayIndex];
      
      for (let hour = minHour; hour <= maxHour; hour++) {
        const slotKey = `${targetDate.format("YYYY-MM-DD")}-${dayName}-${hour}`;
        slots.push(slotKey);
      }
    }
    
    return slots;
  };

  const handleMouseDown = (day, hour) => {
    setIsDragging(true);
    setDragStart({ day, hour });
    setDragEnd({ day, hour });
    dragStartRef.current = { day, hour };
    dragEndRef.current = { day, hour };
    isDraggingRef.current = true;
  };

  const handleMouseEnter = (day, hour) => {
    if (isDraggingRef.current && dragStartRef.current) {
      setDragEnd({ day, hour });
      dragEndRef.current = { day, hour };
    }
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current && dragStartRef.current && dragEndRef.current) {
      const startDay = dragStartRef.current.day;
      const startHour = dragStartRef.current.hour;
      const endDay = dragEndRef.current.day;
      const endHour = dragEndRef.current.hour;
      
      if (onDragSelect) {
        onDragSelect(startDay, startHour, endDay, endHour);
      }
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    dragStartRef.current = null;
    dragEndRef.current = null;
    isDraggingRef.current = false;
  };

  // 전역 마우스 업 이벤트 처리
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        handleMouseUp();
      }
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

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
              
              // 드래그 범위 내에 있는지 확인
              let isInDragRange = false;
              if (isDragging && dragStart && dragEnd) {
                const dragSlots = getSlotsInRange(
                  dragStart.day,
                  dragStart.hour,
                  dragEnd.day,
                  dragEnd.hour
                );
                isInDragRange = dragSlots.includes(slotKey);
              }

              return (
                <div
                  key={`${hour}-${w.format("DD")}`}
                  className="flex flex-shrink-0 w-[44px] h-full items-center justify-center border-l border-[#e7eaf3] cursor-pointer select-none"
                  style={{
                    backgroundColor: isSelected ? "#4DD99F" : isInDragRange ? "#4DD99F80" : "transparent",
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMouseDown(dayName, hour);
                  }}
                  onMouseEnter={(e) => {
                    e.stopPropagation();
                    handleMouseEnter(dayName, hour);
                  }}
                  onMouseUp={(e) => {
                    e.stopPropagation();
                    handleMouseUp();
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

export default EmployeeScheduleCalendar;

