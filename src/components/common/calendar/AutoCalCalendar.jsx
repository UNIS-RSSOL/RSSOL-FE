import dayjs from "dayjs";
import "dayjs/locale/ko";

dayjs.locale("ko");

/**
 * AutoCal 전용 주간 캘린더 미리보기
 * - 날짜 행 없음 (요일만 표시)
 * - 항상 기본 그리드 표시 (더미 데이터 포함)
 * - 선택 후: 실제 스케줄 데이터 표시
 */
function AutoCalCalendar({ hasSelection, schedules }) {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const colors = ["#68e194", "#32d1aa", "#00c1bd"];

  // 더미 데이터: 기본 그리드용
  const dummyWorkers = [
    { id: 1, name: "지민" },
    { id: 2, name: "채은" },
    { id: 3, name: "수진" },
  ];

  // 더미 이벤트: 테스트용
  const dummyEvents = [
    { workerId: 1, worker: "지민", start: dayjs().day(1).hour(9).minute(0).toISOString(), end: dayjs().day(1).hour(13).minute(0).toISOString() },
    { workerId: 2, worker: "채은", start: dayjs().day(3).hour(14).minute(0).toISOString(), end: dayjs().day(3).hour(18).minute(0).toISOString() },
    { workerId: 3, worker: "수진", start: dayjs().day(5).hour(12).minute(0).toISOString(), end: dayjs().day(5).hour(16).minute(0).toISOString() },
  ];

  // 실제 스케줄 데이터 처리
  const normalized = hasSelection && schedules ? (schedules || []).map((s) => ({
    id: s.id || Math.random(),
    workerId: s.userStoreId || s.workerId || s.id,
    worker: s.userName || s.worker || s.workerName || s.name || "근무자",
    start: s.startDatetime || s.start || s.startTime,
    end: s.endDatetime || s.end || s.endTime,
  })) : [];

  // 근무자 목록 (실제 데이터가 있으면 사용, 없으면 더미)
  const workers = normalized.length > 0
    ? Array.from(
        new Map(
          normalized.map((s) => [s.workerId, { id: s.workerId, name: s.worker }]),
        ).values(),
      )
    : dummyWorkers;

  // 이벤트 목록 (실제 데이터가 있으면 사용, 없으면 더미)
  const events = normalized.length > 0 ? normalized : dummyEvents;

  const getColorIndex = (startHour) => {
    const hours = Array.from({ length: 16 }, (_, i) => i + 8);
    const totalHours = hours.length - 1;
    const segmentSize = Math.trunc(totalHours / colors.length);
    const normalizedHour = startHour - hours[0];
    return Math.min(
      colors.length - 1,
      Math.floor(normalizedHour / segmentSize),
    );
  };

  const getEventForCell = (workerId, dayIndex) => {
    return events.find((event) => {
      if (event.workerId !== workerId) return false;
      const d = dayjs(event.start);
      return d.day() === dayIndex;
    });
  };

  return (
    <div
      className={`flex flex-col w-[362px] h-[550px] border-[0.5px] border-black rounded-[20px] bg-white items-center overflow-x-hidden ${workers.length < 8 ? "overflow-y-hidden" : "overflow-y-auto"}`}
    >
      {/* 요일 헤더 */}
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

      {/* 근무자 / 스케줄 영역 */}
      {workers.map((worker) => (
        <div
          key={worker.id}
          className="flex flex-shrink-0 flex-row w-full h-[60px] border-t border-[#e7eaf3]"
        >
          <div className="flex flex-shrink-0 w-[52px] h-full items-center justify-center">
            {worker.name}
          </div>
          {days.map((_, dayIndex) => {
            const event = getEventForCell(worker.id, dayIndex);

            return event ? (
              <div
                key={`${worker.id}-${dayIndex}`}
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
                key={`${worker.id}-${dayIndex}`}
                className="flex flex-shrink-0 w-[44px] h-full items-center justify-center border-l border-[#e7eaf3]"
              ></div>
            );
          })}
        </div>
      ))}
      {workers.length < 8 && (
        <div className="flex flex-shrink-0 flex-row w-full h-full border-t border-[#e7eaf3]">
          <div className="flex-shrink-0 w-[52px] h-full " />
          {days.map((_, i) => (
            <div
              key={i}
              className="flex flex-shrink-0 w-[44px] h-full border-l border-[#e7eaf3]"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AutoCalCalendar;


