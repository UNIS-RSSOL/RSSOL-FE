import Box from "../../components/common/Box.jsx";
import Note from "../../components/common/Note.jsx";
import ColoredCalIcon from "../../assets/icons/ColoredCalIcon.jsx";
import ColoredDollarIcon from "../../assets/icons/ColoredDollarIcon.jsx";
import CheckIcon from "../../assets/icons/CheckIcon.jsx";
import GreenBtn from "../../components/common/GreenBtn.jsx";
import { useEffect, useState } from "react";
import character2 from "../../assets/images/character2.png";
import StoreIcon from "../../assets/icons/StoreIcon.jsx";
import character3 from "../../assets/images/character3.png";
import { fetchSchedules } from "../../services/employee/ScheduleService.js";
import { fetchWage } from "../../services/employee/WageService.js";
import {
  fetchActiveStore,
  fetchMydata,
  fetchStoreList,
  changeActiveStore,
} from "../../services/employee/MyPageService.js";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";

function EmpHome() {
  const [currentTime, setCurrentTime] = useState("");
  const today = dayjs();
  const firstDay = today.format("YYYY.MM.") + "01";
  const [wage, setWage] = useState(0);
  const [activeStore, setActiveStore] = useState({ id: null, name: "" });
  const [username, setUsername] = useState();

  const [todo, setTodo] = useState([]);

  const FormattedDate = (date, day) => {
    return day ? date.format("YYYY.MM.DD(dd)") : date.format("YYYY.MM.DD");
  };

  useEffect(() => {
    (async () => {
      try {
        const schedules = await fetchSchedules(
          today.format("YYYY-MM-DD"),
          today.format("YYYY-MM-DD"),
        );
        const td = schedules.map((s) => ({
          id: s.id,
          storeName: s.storeName,
          start: dayjs(s.startDatetime).format("HH:mm"),
          end: dayjs(s.endDatetime).format("HH:mm"),
        }));
        const my = await fetchMydata();
        setUsername(my.username);
        setTodo(td);

        const active = await fetchActiveStore();
        setActiveStore({
          storeId: active.storeId,
          name: active.name,
        });
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
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const FloatButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [storeList, setStoreList] = useState([]);

    useEffect(() => {
      (async () => {
        try {
          const response = await fetchStoreList();

          const stores = response.map((r) => ({
            storeId: r.storeId,
            name: r.name,
          }));

          setStoreList(stores);
        } catch (error) {
          console.error(error);
        }
      })();
    }, [activeStore]);

    const handleChangeActive = async (storeId) => {
      try {
        const response = await changeActiveStore(storeId);
        setActiveStore({ storeId: response.storeId, name: response.name });
        setIsOpen(false);
        console.log({ storeId: response.storeId, name: response.name });
      } catch (error) {
        console.error(error);
      }
    };

    return (
      <div className="fixed bottom-[80px] right-[calc(50%-196.5px+24px)] flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              {storeList.map((store) => (
                <motion.div
                  key={store.storeId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center text-[10px] font-[500] size-[48px] rounded-full bg-white border-2 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] cursor-pointer ${
                    Number(store.storeId) === Number(activeStore?.storeId)
                      ? "border-[#68e194]"
                      : "border-black"
                  }`}
                  onClick={() => handleChangeActive(store.storeId)}
                >
                  {store.name}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.05, backgroundColor: "#fff" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center size-[48px] rounded-full bg-[#68e194] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <StoreIcon className={isOpen ? "text-[#68e194]" : "text-white"} />
        </motion.div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col py-7 px-5 ">
      <div className="w-full flex flex-col items-start">
        <div className="rounded-[30px] border py-[4px] px-[20px] bg-white border-[#32d1aa] shadow-[0_2px_4px_0_rbga(0,0,0,0.15)] text-[16px] font-[600] inline-block">
          {FormattedDate(today, true)}
        </div>
        <div className="flex items-center mt-2">
          <p className="text-[24px] font-[600] my-1">
            {username}님 오늘의 일정은?
          </p>
          <ColoredCalIcon />
        </div>
        <p className="text-[16px] font-[400] mt-2">
          오늘은 {todo.length}개의 일정이 있어요!
        </p>
      </div>
      <div className="flex justify-center w-full">
        <Note
          className="w-full mt-1 mb-5 max-w-[500px] flex-row flex items-center"
          hole={todo.length - 1}
        >
          <div className="flex h-full flex-1/3 items-end">
            <img
              src={character2}
              alt="character"
              className="size-[90px] mb-1"
            />
          </div>
          <div className="flex flex-2/3 flex-col w-full gap-3 my-2 mr-3">
            {todo.map((td) => (
              <div
                key={td.id}
                className="flex flex-row w-full border-b border-[#87888c] pb-1 justify-between"
              >
                <p className="text-[14px] font-[500]">{td.storeName}</p>
                <p className="text-[14px] font-[400]">
                  {td.start}-{td.end}
                </p>
              </div>
            ))}
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
            <p className="text-[16px] font-[500]">이번 달 누적 월급은?</p>
            <p className="text-[12px] font-[400] mb-5">
              {firstDay}-{FormattedDate(today)}
            </p>
            <p className="text-[24px] font-[400]">{wage}원</p>
          </div>
          <img src={character3} alt="character" className="size-[110px] mr-1" />
        </Box>
      </div>
      <FloatButton />
    </div>
  );
}

export default EmpHome;
