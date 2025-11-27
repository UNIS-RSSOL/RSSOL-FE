import Box from "../../components/common/Box.jsx";
import ColoredCalIcon from "../../assets/icons/ColoredCalIcon.jsx";
import ColoredDollarIcon from "../../assets/icons/ColoredDollarIcon.jsx";
import CheckIcon from "../../assets/icons/CheckIcon.jsx";
import GreenBtn from "../../components/common/GreenBtn.jsx";
import { useEffect, useState } from "react";
import character1 from "../../assets/images/character1.png";
import Note from "../../components/common/Note.jsx";
import ResourceCalendar from "../../components/common/calendar/ResourceCalendar.jsx";

function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const today = new Date();
  const firstDay =
    today.getFullYear().toString().slice(-2) +
    "." +
    (today.getMonth() + 1) +
    ".01";
  const dat = ["일", "월", "화", "수", "목", "금", "토"];

  const formattedToday =
    today.getFullYear() +
    "." +
    (today.getMonth() + 1) +
    "." +
    today.getDate() +
    "(" +
    dat[today.getDay()] +
    ")";
  const formattedToday2 =
    today.getFullYear().toString().slice(-2) +
    "." +
    (today.getMonth() + 1) +
    "." +
    today.getDate();

  useEffect(() => {
    // Initialize time
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    // Update time immediately
    updateTime();

    // Set up interval to update time every second for real-time display
    const intervalId = setInterval(updateTime, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full flex flex-col py-7 px-5">
      <div className="w-full flex flex-col items-start">
        <div className="rounded-[30px] border py-[4px] px-[20px] bg-white border-[#32d1aa] shadow-[0_2px_4px_0_rbga(0,0,0,0.15)] text-[16px] font-[600] inline-block">
          {formattedToday}
        </div>
        <div className="flex items-center mt-2">
          <p className="text-[24px] font-[600] my-1">
            알쏠 1호점 오늘의 일정은?
          </p>
          <ColoredCalIcon />
        </div>
      </div>
      <div className="flex justify-center w-full">
        <Note
          className="w-full my-5 max-w-[500px] overflow-x-hidden"
          disabled={true}
        >
          <ResourceCalendar />
        </Note>
      </div>
      <div className="flex items-center">
        <CheckIcon />
        <p className="text-[18px] font-[500] ml-1 my-2">출퇴근 체크!</p>
      </div>
      <div className="flex justify-center w-full">
        <Box
          className="flex flex-row items-center justify-between mb-5 w-full max-w-[500px]"
          disabled={true}
        >
          <div className="flex flex-col items-center justify-center">
            <p className="text-[16px] font-[500]">서브웨이</p>
            <p className="text-[14px] font-[400] text-[#7a7676]">
              {formattedToday2}
            </p>
          </div>
          <p className="text-[24px] font-[400]">{currentTime}</p>
          <GreenBtn className={"w-[120px] h-[30px] py-0 mt-0"}>
            출근하기
          </GreenBtn>
        </Box>
      </div>
      <div className="flex items-center">
        <ColoredDollarIcon />
        <p className="text-[18px] font-[500] ml-1 my-2">급여관리</p>
      </div>
      <div className="flex justify-center w-full">
        <Box
          className="flex flex-row items-center justify-between px-8 w-full max-w-[500px]"
          disabled={true}
        >
          <div className="flex flex-col items-start ">
            <p className="text-[16px] font-[500]">이번 달 누적 지출은?</p>
            <p className="text-[12px] font-[400] mb-5">
              {firstDay}-{formattedToday2}
            </p>
            <p className="text-[24px] font-[400]">234,550원</p>
          </div>
          <img src={character1} alt="character" className="size-[110px] mr-1" />
        </Box>
      </div>
    </div>
  );
}

export default Home;
