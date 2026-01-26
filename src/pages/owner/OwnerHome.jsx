import Box from "../../components/Box.jsx";
import RoundTag from "../../components/RoundTag.jsx";
import ColoredCalIcon from "../../assets/newicons/ColoredCalIcon.jsx";
import ColoredDollarIcon from "../../assets/newicons/ColoredDollarIcon.jsx";
import ColoredCheckIcon from "../../assets/newicons/ColoredCheckIcon.jsx";
import Button from "../../components/Button.jsx";
import { useEffect, useState } from "react";
import character1 from "../../assets/images/character1.png";
import Note from "../../components/Note.jsx";
import OwnerHomeCalendar from "../../components/common/calendar/OwnerHomeCalendar.jsx";
import { getScheduleByPeriod } from "../../services/new/WorkShiftService.js";
import {
  getActiveStore,
  getOwnerStoreList,
} from "../../services/new/MypageService.js";
import dayjs from "dayjs";
import FloatButton from "../../components/mypage/FloatButton.jsx";

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
        const stores = await getOwnerStoreList();
        const active = await getActiveStore();

        setStoreList(stores);
        setActiveStore({
          storeId: active.storeId,
          name: active.name,
        });
        console.log(activeStore);
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
      const schedules = await getScheduleByPeriod(
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
        <RoundTag>{FormattedDate(today, true)}</RoundTag>
        <div className="flex items-center mt-2">
          <p className="text-[24px] font-[600]">
            {activeStore?.name} 오늘의 일정은?
          </p>
          <ColoredCalIcon />
        </div>
      </div>
      <div className="flex justify-center w-full">
        <Note className="w-full my-5 overflow-x-hidden" hole={workers.length}>
          <OwnerHomeCalendar e={events} w={workers} />
        </Note>
      </div>
      <div className="flex items-center my-2">
        <ColoredCheckIcon />
        <p className="text-[18px] font-[500] ml-1">출퇴근 체크!</p>
      </div>
      <div className="flex justify-center w-full">
        <Box className="flex items-center justify-between mb-5" disabled={true}>
          <div className="flex flex-col items-center justify-center">
            <p className="text-[16px] font-[500]">{activeStore?.name}</p>
            <p className="text-[14px] font-[400] text-[#7a7676]">
              {FormattedDate(today)}
            </p>
          </div>
          <p className="text-[24px] font-[400]">{currentTime}</p>
          <Button className={"w-[136px] h-[32px]"}>출근하기</Button>
        </Box>
      </div>
      <div className="flex items-center my-2">
        <ColoredDollarIcon />
        <p className="text-[18px] font-[500] ml-1">급여관리</p>
      </div>
      <div className="flex justify-center w-full">
        <Box
          className="items-center justify-between px-7 py-2 w-full"
          disabled={true}
        >
          <div className="flex flex-col items-start justify-center">
            <p className="text-[16px] font-[500]">이번 달 누적 지출은?</p>
            <p className="text-[12px] font-[400] mb-5">
              {firstDay}-{FormattedDate(today)}
            </p>
            <p className="text-[24px] font-[400]">{wage}원</p>
          </div>
          <img src={character1} alt="character" className="size-[115px] mr-1" />
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
