import Box from "../../components/common/Box.jsx";
import Note from "../../components/home/Note.jsx";
import Button from "../../components/common/Button.jsx";
import RoundTag from "../../components/common/RoundTag.jsx";
import ColoredCalIcon from "../../assets/icons/ColoredCalIcon.jsx";
import ColoredDollarIcon from "../../assets/icons/ColoredDollarIcon.jsx";
import ColoredCheckIcon from "../../assets/icons/ColoredCheckIcon.jsx";
import { useEffect, useState } from "react";
import character2 from "../../assets/images/character2.png";
import character3 from "../../assets/images/character3.png";
import { getMyScheduleByPeriod } from "../../services/WorkShiftService.js";
import {
  getActiveStore,
  getStaffProfile,
  getStaffStoreList,
} from "../../services/MypageService.js";
import FloatButton from "../../components/home/FloatButton.jsx";
import dayjs from "dayjs";

function EmpHome() {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const today = dayjs();
  const firstDay = today.format("YYYY.MM.") + "01";
  const [wage, setWage] = useState(0);
  const [activeStore, setActiveStore] = useState({ id: null, name: "" });
  const [storeList, setStoreList] = useState([]);
  const [username, setUsername] = useState();
  const [todo, setTodo] = useState([]);

  const handleActiveStoreChange = (newActiveStore) => {
    setActiveStore(newActiveStore);
  };

  const FormattedDate = (date, day) => {
    return day ? date.format("YYYY.MM.DD(dd)") : date.format("YYYY.MM.DD");
  };

  useEffect(() => {
    (async () => {
      try {
        const schedules = await getMyScheduleByPeriod(
          today.format("YYYY-MM-DD"),
          today.format("YYYY-MM-DD"),
        );
        const td = schedules.map((s) => ({
          id: s.id,
          storeName: s.storeName,
          start: dayjs(s.startDatetime).format("HH:mm"),
          end: dayjs(s.endDatetime).format("HH:mm"),
        }));
        const my = await getStaffProfile();
        setUsername(my.username);
        setTodo(td);

        const active = await getActiveStore();
        const stores = await getStaffStoreList();

        setActiveStore({
          storeId: active.storeId,
          name: active.name,
        });
        setStoreList(stores);
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

  // 출근 기능이 RN 앱(WebView) 안인지 판단
  const isInApp = () => {
    return typeof window !== "undefined" && !!window.ReactNativeWebView;
  };

  // 출근하기 버튼 클릭 함수
  const handleGoWork = () => {
    if (!isInApp()) {
      // 👉 웹 브라우저 → 모달 띄우기
      setIsAppModalOpen(true);
      return;
    }

    // 👉 RN WebView → 앱으로 메시지 보내기
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ action: "goToGPS" }),
    );
  };

  return (
    <div className="w-full flex flex-col py-7 px-5 ">
      <div className="w-full flex flex-col items-start">
        <RoundTag>{FormattedDate(today, true)}</RoundTag>
        <div className="flex items-center mt-2">
          <p className="text-[24px] font-[600]">{username}님 오늘의 일정은?</p>
          <ColoredCalIcon />
        </div>
        <p className="text-[16px] font-[400] mt-2">
          오늘은 {todo.length}개의 일정이 있어요!
        </p>
      </div>
      <div className="flex justify-center w-full">
        <Note
          className="relative mt-1 mb-5 flex-row "
          hole={todo.length - 1 < 2 ? 2 : todo.length - 1}
        >
          <div className="flex flex-1/3">
            <img
              src={character2}
              alt="character"
              className="absolute bottom-1 left-6 size-[90px]"
            />
          </div>
          <div className="flex flex-2/3 flex-col gap-3 my-2 mr-3">
            {todo.map((td) => (
              <div
                key={td.id}
                className="flex flex-row w-full border-b border-[#87888c] justify-between"
              >
                <p className="text-[16px] font-[500]">{td.storeName}</p>
                <p className="text-[16px] font-[400]">
                  {td.start}-{td.end}
                </p>
              </div>
            ))}
          </div>
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
          <Button
            className={"w-[136px] h-[32px]"}
            onClick={handleGoWork} //시은추가
          >
            출근하기
          </Button>
        </Box>
        {/* -------- 앱 전용 안내 모달 -------- */}
        {isAppModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl p-6 w-80 text-center">
              <p className="text-lg font-semibold mb-3">앱 전용 기능입니다</p>
              <p className="text-sm text-gray-700 mb-5">
                출퇴근 기능은 알솔 앱에서만 사용할 수 있어요.
              </p>
              <button
                className="text-white px-4 py-2 rounded-lg"
                onClick={() => setIsAppModalOpen(false)}
                style={{ backgroundColor: "#68e194" }}
              >
                확인
              </button>
            </div>
          </div>
        )}
        {/* -------------------------------- */}
      </div>
      <div className="flex items-center">
        <ColoredDollarIcon />
        <p className="text-[18px] font-[500] ml-1 my-2">급여관리</p>
      </div>
      <div className="flex justify-center w-full">
        <Box
          className="items-center justify-between px-7 py-2 w-full"
          disabled={true}
        >
          <div className="flex flex-col items-start justify-center">
            <p className="text-[16px] font-[500]">이번 달 누적 월급은?</p>
            <p className="text-[12px] font-[400] mb-5">
              {firstDay}-{FormattedDate(today)}
            </p>
            <p className="text-[24px] font-[400]">{wage}원</p>
          </div>
          <img src={character3} alt="character" className="size-[115px] mr-1" />
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

export default EmpHome;
