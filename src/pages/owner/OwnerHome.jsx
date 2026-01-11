import Box from "../../components/common/Box.jsx";
import ColoredCalIcon from "../../assets/icons/ColoredCalIcon.jsx";
import ColoredDollarIcon from "../../assets/icons/ColoredDollarIcon.jsx";
import CheckIcon from "../../assets/icons/CheckIcon.jsx";
import GreenBtn from "../../components/common/GreenBtn.jsx";
import { useEffect, useState } from "react";
import character1 from "../../assets/images/character1.png";
import Note from "../../components/common/Note.jsx";
import ResourceCalendar from "../../components/common/calendar/ResourceCalendar.jsx";
import { fetchSchedules } from "../../services/common/ScheduleService.js";
import {
  fetchActiveStore,
  fetchStoreList,
} from "../../services/owner/MyPageService.js";
import dayjs from "dayjs";

import FloatButton from "../../components/common/FloatButton.jsx";

function OwnerHome() {
  const [currentTime, setCurrentTime] = useState("");
  let today = dayjs();
  const firstDay = today.format("YYYY.MM.") + "01";
  const dat = ["일", "월", "화", "수", "목", "금", "토"];
  const [wage, setWage] = useState(0);
  const [workers, setWorkers] = useState([]);
  const [events, setEvents] = useState([]);
  const [storeList, setStoreList] = useState([]);
  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });

  const handleActiveStoreChange = (newActiveStore) => {
    setActiveStore(newActiveStore);
  };

  const FormattedDate = (date, day) => {
    const d = dat[today.format("d")];
    return day
      ? date.format("YYYY.MM.DD(") + d + ")"
      : date.format("YYYY.MM.DD");
  };

  useEffect(() => {
    (async () => {
      try {
        const stores = await fetchStoreList();
        const active = await fetchActiveStore();

        setStoreList(stores);
        setActiveStore({
          storeId: active.storeId,
          name: active.name,
        });
        console.log(activeStore);
        // const fetchedWage = await fetchWage(
        //   activeStore.storeId,
        //   today.format("YYYY-MM"),
        // );
        // const totalWage = fetchedWage.payrolls.reduce((sum, payroll) => {
        //   return sum + payroll.total_pay;
        // }, 0);

        // setWage(totalWage);
      } catch (error) {
        console.error(error);
      }
    })();

    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    (async () => {
      const schedules = await fetchSchedules(
        today.format("YYYY-MM-DD"),
        today.format("YYYY-MM-DD"),
      );

      const formattedEvents = schedules.map((schedule) => ({
        id: schedule.id,
        workerId: schedule.userStoreId,
        worker: schedule.username,
        start: schedule.startDatetime,
        end: schedule.endDatetime,
      }));
      const uniqueWorkers = Array.from(
        schedules
          .reduce((map, schedule) => {
            if (!map.has(schedule.userStoreId)) {
              map.set(schedule.userStoreId, {
                id: schedule.userStoreId,
                name: schedule.username,
              });
            }
            return map;
          }, new Map())
          .values(),
      );
      setWorkers(uniqueWorkers);
      setEvents(formattedEvents);
    })();
  }, [activeStore]);

  return (
    <div className="w-full flex flex-col py-7 px-5">
      <div className="w-full flex flex-col items-start">
        <div className="rounded-[30px] border py-[4px] px-[20px] bg-white border-[#32d1aa] shadow-[0_2px_4px_0_rbga(0,0,0,0.15)] text-[16px] font-[600] inline-block">
          {FormattedDate(today, true)}
        </div>
        <div className="flex items-center mt-2">
          <p className="text-[24px] font-[600] my-1">
            {activeStore?.name} 오늘의 일정은?
          </p>
          <ColoredCalIcon />
        </div>
      </div>
      <div className="flex justify-center w-full">
        <Note
          className="w-full my-5 max-w-[500px] overflow-x-hidden"
          hole={workers.length}
        >
          <ResourceCalendar e={events} w={workers} />
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
            <p className="text-[16px] font-[500]">{activeStore?.name}</p>
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
            <p className="text-[16px] font-[500]">이번 달 누적 지출은?</p>
            <p className="text-[12px] font-[400] mb-5">
              {firstDay}-{FormattedDate(today)}
            </p>
            <p className="text-[24px] font-[400]">{wage}원</p>
          </div>
          <img src={character1} alt="character" className="size-[110px] mr-1" />
        </Box>
      </div>
      <FloatButton
        stores={storeList}
        active={activeStore}
        onActiveStoreChange={handleActiveStoreChange}
      />
    </div>
  );
}

export default OwnerHome;
