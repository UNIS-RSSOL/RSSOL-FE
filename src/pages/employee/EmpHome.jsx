import Box from "../../components/common/Box.jsx";
import Note from "../../components/common/Note.jsx";
import ColoredCalIcon from "../../assets/icons/ColoredCalIcon.jsx";
import ColoredDollarIcon from "../../assets/icons/ColoredDollarIcon.jsx";
import CheckIcon from "../../assets/icons/CheckIcon.jsx";
import GreenBtn from "../../components/common/GreenBtn.jsx";
import { useEffect, useState } from "react";
import character2 from "../../assets/images/character2.png";
import character3 from "../../assets/images/character3.png";
import { fetchSchedules } from "../../services/common/ScheduleService.js";
import { fetchWage } from "../../services/employee/WageService.js";
import { fetchActiveStore } from "../../services/employee/MyPageService.js";
import dayjs from "dayjs";

function EmpHome() {
  const [currentTime, setCurrentTime] = useState("");
  const today = dayjs();
  const firstDay = today.format("YYYY.MM.") + "01";
  const dat = ["일", "월", "화", "수", "목", "금", "토"];
  const [wage, setWage] = useState(0);
  const [todo, setTodo] = useState([]);

  const FormattedDate = (date, day) => {
    const d = dat[today.format("d")];
    return day
      ? date.format("YYYY.MM.DD(") + d + ")"
      : date.format("YYYY.MM.DD");
  };

  useEffect(() => {
    (async () => {
      try {
        const active = await fetchActiveStore();
        const wageRes = await fetchWage(
          active.storeId,
          today.format("YYYY-MM"),
        );
        setWage(wageRes.total_pay);
      } catch (error) {
        console.error(error);
      }
    })();

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full flex flex-col py-7 px-5 ">
      <div className="w-full flex flex-col items-start">
        <div className="rounded-[30px] border py-[4px] px-[20px] bg-white border-[#32d1aa] shadow-[0_2px_4px_0_rbga(0,0,0,0.15)] text-[16px] font-[600] inline-block">
          {FormattedDate(today, true)}
        </div>
        <div className="flex items-center mt-2">
          <p className="text-[24px] font-[600] my-1">홍길동님 오늘의 일정은?</p>
          <ColoredCalIcon />
        </div>
        <p className="text-[16px] font-[400] mt-2">
          오늘은 2개의 일정이 있어요!
        </p>
      </div>
      <div className="flex justify-center w-full">
        <Note className="w-full mt-1 mb-5 max-w-[500px]" hole={4}>
          <img src={character2} alt="character" className="size-[110px] mr-1" />
          <div className="flex flex-col w-full gap-3 my-2 mx-1 mr-3">
            <div className="flex flex-row w-full border-b border-[#87888c] pb-1 justify-between">
              <p className="text-[16px] font-[500]">알쏠 1호점</p>
              <p className="text-[16px] font-[400]">09:30-13:00</p>
            </div>
            <div className="flex flex-row w-full border-b border-[#87888c] pb-1 justify-between">
              <p className="text-[16px] font-[500]">알쏠 1호점</p>
              <p className="text-[16px] font-[400]">09:30-13:00</p>
            </div>
            <div className="flex flex-row w-full border-b border-[#87888c] pb-1 justify-between">
              <p className="text-[16px] font-[500]">알쏠 1호점</p>
              <p className="text-[16px] font-[400]">09:30-13:00</p>
            </div>
            <div className="flex flex-row w-full border-b border-[#87888c] pb-1 justify-between">
              <p className="text-[16px] font-[500]">알쏠 1호점</p>
              <p className="text-[16px] font-[400]">09:30-13:00</p>
            </div>
          </div>
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
              {FormattedDate(today)}
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
            <p className="text-[16px] font-[500]">이번 달 누적 월급은?</p>
            <p className="text-[12px] font-[400] mb-5">
              {firstDay}-{FormattedDate(today)}
            </p>
            <p className="text-[24px] font-[400]">{wage}원</p>
          </div>
          <img src={character3} alt="character" className="size-[110px] mr-1" />
        </Box>
      </div>
    </div>
  );
}

export default EmpHome;
