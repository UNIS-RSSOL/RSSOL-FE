import dayjs from "dayjs";
import ClockIcon from "../../assets/icons/ClockIcon.jsx";
import UtensilsIcon from "../../assets/icons/UtensilsIcon.jsx";

function WorkInfoCard({ todayShift, onCheckIn, onCheckOut, attendance }) {
  const isCheckedIn = attendance?.isCheckedIn || attendance?.checkedIn;
  const isCheckedOut = attendance?.isCheckedOut || attendance?.checkedOut;

  return (
    <div className="border-[1px] border-[#E7EAF3] rounded-[25px] overflow-hidden mb-[12px]">
      <div className="px-[16px] py-[14px] flex flex-col gap-[8px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <ClockIcon />
            <span className="text-[14px] font-[500]">근무시간</span>
          </div>
          <span className="inline-flex items-center justify-center min-w-[70px] h-[30px] bg-[#F0F0F0] text-[#87888c] rounded-[20px] px-[12px] text-[12px] font-[500]">
            {todayShift
              ? `${dayjs(todayShift.startDatetime).format("HH:mm")} - ${dayjs(todayShift.endDatetime).format("HH:mm")}`
              : "출근 전"}
          </span>
        </div>
        <div className="flex items-center gap-[8px]">
          <UtensilsIcon />
          <span className="text-[14px] font-[500]">휴게시간</span>
        </div>
      </div>

      <div className="flex mx-[16px] mb-[14px] h-[44px] rounded-full border-[1px] border-[#B0B0B0] overflow-hidden">
        <div
          onClick={isCheckedIn ? undefined : onCheckIn}
          className={`flex-1 flex items-center justify-center text-[14px] font-[500] border-r-[1px] border-[#B0B0B0] ${
            isCheckedIn
              ? "bg-[#3370FF] text-white cursor-default"
              : "cursor-pointer"
          }`}
        >
          {isCheckedIn ? "출근 완료" : "출근하기"}
        </div>
        <div
          onClick={isCheckedIn && !isCheckedOut ? onCheckOut : undefined}
          className={`flex-1 flex items-center justify-center text-[14px] font-[500] ${
            isCheckedOut
              ? "bg-[#3370FF] text-white cursor-default"
              : isCheckedIn
                ? "cursor-pointer"
                : "text-[#B0B0B0] cursor-default"
          }`}
        >
          {isCheckedOut ? "퇴근 완료" : "퇴근하기"}
        </div>
      </div>
    </div>
  );
}

export default WorkInfoCard;
