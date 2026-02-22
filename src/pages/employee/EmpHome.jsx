import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";

import { getMyScheduleByPeriod } from "../../services/WorkShiftService.js";
import {
  getActiveStore,
  getStaffStoreList,
  changeActiveStore,
} from "../../services/MypageService.js";

import BellIcon from "../../assets/icons/BellIcon.jsx";
import HomeIcon from "../../assets/icons/HomeIcon.jsx";
import CalendarIcon from "../../assets/icons/CalendarIcon.jsx";
import EditIcon from "../../assets/icons/EditIcon.jsx";
import FileEditIcon from "../../assets/icons/FileEditIcon.jsx";
import LeftArrowIcon from "../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../assets/icons/RightArrowIcon.jsx";
import logoImg from "../../assets/images/logo-default.svg";
import FooterMenu from "../../components/layout/footer/FooterMenu.jsx";

/* ── Inline SVG Icons ── */

function HamburgerIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path
        d="M1 1H19M1 7H19M1 13H19"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="#87888c" strokeWidth="1.5" />
      <path
        d="M9 5V9L11.5 11.5"
        stroke="#87888c"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UtensilsIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <path
        d="M3 1V5M5 1V5M7 1V5M3 5C3 5 2.5 7 5 7.5V17M7 5C7 5 7.5 7 5 7.5"
        stroke="#87888c"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 1V17M12 1C12 1 15 2.5 15 5.5C15 8 12 8.5 12 8.5"
        stroke="#87888c"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Constants ── */

const TIMELINE_START = 8;
const TIMELINE_END = 16;
const TIMELINE_HOURS = Array.from({ length: 8 }, (_, i) => i + TIMELINE_START);

/* ── 임시 일정 데이터 (백엔드 연결 후 제거) ── */
const MOCK_SCHEDULES = [
  {
    id: "mock-1",
    storeName: "투썸 신촌점",
    startDatetime: dayjs().hour(8).minute(0).second(0).format(),
    endDatetime: dayjs().hour(12).minute(0).second(0).format(),
  },
  {
    id: "mock-2",
    storeName: "연일밥집",
    startDatetime: dayjs().hour(11).minute(0).second(0).format(),
    endDatetime: dayjs().hour(15).minute(0).second(0).format(),
  },
];

/* ── Component ── */

function EmpHome() {
  const navigate = useNavigate();
  const today = dayjs();

  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });
  const [storeList, setStoreList] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState(MOCK_SCHEDULES); // 임시 데이터로 초기화
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [todos, setTodos] = useState([
    { id: 1, text: "마감 조 청소", done: false },
    { id: 2, text: "오픈 조 청소", done: true },
    { id: 3, text: "마감 조 청소", done: false },
    { id: 4, text: "마감 조 청소", done: false },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStore({ storeId: active.storeId, name: active.name });

        const stores = await getStaffStoreList();
        setStoreList(stores);

        const todayStr = today.format("YYYY-MM-DD");
        const schedules = await getMyScheduleByPeriod(todayStr, todayStr);
        // 임시: API 결과가 비어있으면 목업 데이터 사용
        if (schedules && schedules.length > 0) {
          setTodaySchedules(schedules);
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const todayShift = todaySchedules[0];

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const isInApp = () =>
    typeof window !== "undefined" && !!window.ReactNativeWebView;

  const handleCheckIn = () => {
    if (!isInApp()) {
      setIsAppModalOpen(true);
      return;
    }
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ action: "goToGPS" }),
    );
  };

  const handleStoreChange = async (storeId) => {
    try {
      const res = await changeActiveStore(storeId);
      setActiveStore({ storeId: res.storeId, name: res.name });
      setSidebarOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white font-Pretendard">
      {/* ── Header ── */}
      <header className="flex items-center px-[16px] h-[52px] shrink-0 gap-[12px]">
        <div
          className="cursor-pointer p-[4px]"
          onClick={() => setSidebarOpen(true)}
        >
          <HamburgerIcon />
        </div>
        <p className="text-[16px] font-[600] leading-[20px] flex-1 text-left">
          {activeStore.name || "현재 매장 이름"}
        </p>
        <div
          className="cursor-pointer p-[4px]"
          onClick={() => navigate("/employee/notification")}
        >
          <BellIcon />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto px-[16px] pt-[8px] pb-[16px]">
        {/* Date */}
        <p className="text-[16px] font-[500] mb-[12px] text-left">
          {today.format("M월 D일")}
        </p>

        {/* Work Info Card */}
        <div className="border-[1px] border-[#E7EAF3] rounded-[25px] overflow-hidden mb-[12px]">
          {/* Info Section — padding 16px */}
          <div className="px-[16px] py-[14px] flex flex-col gap-[8px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <ClockIcon />
                <span className="text-[14px] font-[500]">근무시간</span>
              </div>
              {/* 출근 전 태그 — 70x30, radius 20 */}
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

          {/* Buttons Section */}
          <div className="flex mx-[16px] mb-[14px] h-[44px] rounded-full border-[1px] border-[#E7EAF3] overflow-hidden">
            <div
              onClick={handleCheckIn}
              className="flex-1 flex items-center justify-center text-[14px] font-[500] cursor-pointer border-r-[1px] border-[#E7EAF3]"
            >
              출근하기
            </div>
            <div className="flex-1 flex items-center justify-center text-[14px] font-[500] cursor-pointer">
              퇴근하기
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="border-[1px] border-[#E7EAF3] rounded-[25px] overflow-hidden mb-[16px]">
          <div className="px-[16px] py-[14px]">
            <div className="flex items-center justify-between mb-[12px]">
              <p className="text-[16px] font-[600]">오늘 해야할 일</p>
              {/* 매장전체 태그 — 70x30, radius 20 */}
              <span className="inline-flex items-center justify-center min-w-[70px] h-[30px] bg-[#F0F0F0] text-[#87888c] rounded-[20px] px-[12px] text-[12px] font-[500]">
                매장전체
              </span>
            </div>
            <div className="flex flex-col gap-[8px]">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-[8px] cursor-pointer"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center ${
                      todo.done
                        ? "bg-[#3370FF] border-[#3370FF]"
                        : "border-[#D9D9D9] bg-white"
                    }`}
                  >
                    {todo.done && (
                      <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px]">{todo.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mini Timeline ── */}
        <div>
          {/* Time labels */}
          <div className="flex">
            {TIMELINE_HOURS.map((h, i) => (
              <div
                key={h}
                className={`flex-1 text-center text-[13px] font-[500] ${
                  i === 0 ? "text-[#004DFF]" : "text-[#D9D9D9]"
                }`}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Schedule grid */}
          <div className="relative mt-[4px] h-[160px]">
            {/* Grid lines */}
            <div className="absolute inset-0 flex">
              {TIMELINE_HOURS.map((h, i) => (
                <div
                  key={h}
                  className={`flex-1 ${i === 0 ? "border-l border-[#004DFF]/30" : ""} border-r border-[#E7EAF3]`}
                />
              ))}
            </div>

            {/* Schedule blocks */}
            {todaySchedules.map((s, i) => {
              const startH = dayjs(s.startDatetime).hour();
              const startM = dayjs(s.startDatetime).minute();
              const endH = dayjs(s.endDatetime).hour();
              const endM = dayjs(s.endDatetime).minute();
              const startDecimal = startH + startM / 60;
              const endDecimal = (endH === 0 ? 24 : endH) + endM / 60;
              const clampedStart = Math.max(startDecimal, TIMELINE_START);
              const clampedEnd = Math.min(endDecimal, TIMELINE_END);
              if (clampedStart >= TIMELINE_END || clampedEnd <= TIMELINE_START)
                return null;
              const left =
                ((clampedStart - TIMELINE_START) /
                  (TIMELINE_END - TIMELINE_START)) *
                100;
              const width =
                ((clampedEnd - clampedStart) /
                  (TIMELINE_END - TIMELINE_START)) *
                100;
              return (
                <div
                  key={s.id || i}
                  className="absolute rounded-[8px] px-[8px] flex items-start pt-[6px]"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${i * 50 + 4}px`,
                    height: "46px",
                    backgroundColor: i === 0 ? "#E7EAF3" : "#F0F0F0",
                    border: "1px solid #E7EAF3",
                  }}
                >
                  <span className="text-[12px] font-[500] truncate">
                    {s.storeName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="w-full h-[60px] flex flex-row justify-around items-center shrink-0 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)] bg-white">
        <FooterMenu
          MenuIcon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M1 7.41605C1 7.04666 1.18802 6.7001 1.50457 6.48603L9.30457 1.21117C9.72092 0.929609 10.2791 0.92961 10.6954 1.21117L18.4954 6.48603C18.812 6.7001 19 7.04665 19 7.41605V17.2882C19 18.2336 18.1941 19 17.2 19H2.8C1.80589 19 1 18.2336 1 17.2882V7.41605Z"
                fill="#3370FF"
              />
              <path
                d="M5.5 15.0625H14.5M9.30457 1.21117L1.50457 6.48603C1.18802 6.7001 1 7.04666 1 7.41605V17.2882C1 18.2336 1.80589 19 2.8 19H17.2C18.1941 19 19 18.2336 19 17.2882V7.41605C19 7.04665 18.812 6.7001 18.4954 6.48603L10.6954 1.21117C10.2791 0.92961 9.72092 0.929609 9.30457 1.21117Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="홈"
          onClick={() => {}}
        />
        <FooterMenu
          MenuIcon={<CalendarIcon />}
          title="캘린더"
          onClick={() => navigate("/employee/calendar")}
        />
        <FooterMenu
          MenuIcon={<EditIcon />}
          title="할 일"
          onClick={() => {}}
        />
        <FooterMenu
          MenuIcon={<FileEditIcon />}
          title="근무표 제출"
          onClick={() => navigate("/employee/schedule/modifying")}
        />
      </nav>

      {/* ── Sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 w-[280px] h-full bg-white z-50 flex flex-col"
            >
              {/* Sidebar inner — padding 16 top/bottom, 16 left/right */}
              <div className="flex-1 flex flex-col px-[16px] pt-[40px] pb-[24px]">
                <h2 className="text-[22px] font-[700] mb-[24px] text-left">
                  {activeStore.name || "매장 이름"}
                </h2>

                <p
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate("/employee/manage");
                  }}
                  className="text-[16px] py-[8px] cursor-pointer text-left"
                >
                  급여관리
                </p>

                <hr className="my-[16px] border-[#E7EAF3]" />

                <p className="text-[18px] font-[700] mb-[12px] text-left">
                  매장전환
                </p>
                <div className="flex flex-col gap-[8px]">
                  {storeList.map((store) => (
                    <p
                      key={store.storeId}
                      onClick={() => handleStoreChange(store.storeId)}
                      className={`text-[16px] py-[4px] cursor-pointer text-left ${
                        Number(store.storeId) === Number(activeStore.storeId)
                          ? "font-[600]"
                          : "font-[400]"
                      }`}
                    >
                      {store.name}
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-[16px] mt-[20px] text-[16px] text-[#87888c]">
                  <LeftArrowIcon
                    color="#87888c"
                    className="cursor-pointer"
                  />
                  <span>
                    1 / {Math.max(1, Math.ceil(storeList.length / 5))}
                  </span>
                  <RightArrowIcon className="cursor-pointer" />
                </div>

                {/* Bottom area */}
                <div className="mt-auto flex flex-col items-center gap-[16px]">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={logoImg}
                      alt="알쏠 로고"
                      className="h-[40px] object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-[8px] text-[13px] text-[#87888c]">
                    <span
                      className="cursor-pointer"
                      onClick={() => {
                        setSidebarOpen(false);
                        navigate("/employee/mypage");
                      }}
                    >
                      내 정보 수정
                    </span>
                    <span>|</span>
                    <span className="cursor-pointer" onClick={handleLogout}>
                      로그아웃
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── App-only modal ── */}
      {isAppModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-[16px] p-[24px] w-[300px] text-center">
            <p className="text-[18px] font-[600] mb-[12px]">
              앱 전용 기능입니다
            </p>
            <p className="text-[14px] text-[#87888c] mb-[20px]">
              출퇴근 기능은 알솔 앱에서만 사용할 수 있어요.
            </p>
            <div
              className="inline-flex items-center justify-center w-full h-[44px] rounded-[10px] bg-[#3370FF] text-white text-[14px] font-[500] cursor-pointer"
              onClick={() => setIsAppModalOpen(false)}
            >
              확인
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmpHome;
