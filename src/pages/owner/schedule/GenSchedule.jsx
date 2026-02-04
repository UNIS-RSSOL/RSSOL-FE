import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useNavigate } from "react-router-dom";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon.jsx";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import WeekCalendar from "../../../components/calendar/WeekCalendar.jsx";
import BottomBar from "../../../components/layout/footer/BottomBar.jsx";

function GenSchedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(dayjs().locale("ko"));

  const goPrevWeek = () => setCurrentDate((prev) => prev.subtract(1, "week"));
  const goNextWeek = () => setCurrentDate((prev) => prev.add(1, "week"));

  const formattedMonth = currentDate.format("YYYY.MM");

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fd]">
      <TopBar title="근무표 생성" onBack={() => navigate(-1)} />

      <div className="flex-1 px-4 py-3 flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <LeftArrowIcon className="cursor-pointer" onClick={goPrevWeek} />
          <div className="w-[130px] text-lg font-semibold">
            {formattedMonth}
          </div>
          <RightArrowIcon className="cursor-pointer" onClick={goNextWeek} />
        </div>

        <div className="flex justify-center">
          <WeekCalendar date={currentDate} />
        </div>
      </div>

      <BottomBar
        singleButton
        singleButtonText="근무표 저장하기"
        onSingleClick={() => navigate("/employee/schedule")}
      />
    </div>
  );
}

export default GenSchedule;
