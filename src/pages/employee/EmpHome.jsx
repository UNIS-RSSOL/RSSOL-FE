import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { getMyScheduleByPeriod } from "../../services/WorkShiftService.js";
import {
  getActiveStore,
  getStaffStoreList,
  changeActiveStore,
} from "../../services/MypageService.js";

import BellIcon from "../../assets/icons/BellIcon.jsx";
import CalendarIcon from "../../assets/icons/CalendarIcon.jsx";
import EditIcon from "../../assets/icons/EditIcon.jsx";
import FileEditIcon from "../../assets/icons/FileEditIcon.jsx";
import FooterMenu from "../../components/layout/footer/FooterMenu.jsx";

import HomeHeader from "../../components/home/HomeHeader.jsx";
import WorkInfoCard from "../../components/home/WorkInfoCard.jsx";
import TasksCard from "../../components/home/TasksCard.jsx";
import MiniTimeline from "../../components/home/MiniTimeline.jsx";
import HomeSidebar from "../../components/home/HomeSidebar.jsx";
import AppOnlyModal from "../../components/home/AppOnlyModal.jsx";

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
  const [todaySchedules, setTodaySchedules] = useState(MOCK_SCHEDULES);
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

  const sidebarMenuItems = [
    {
      label: "급여관리",
      onClick: () => {
        setSidebarOpen(false);
        navigate("/employee/manage");
      },
    },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      <HomeHeader
        storeName={activeStore.name}
        onMenuClick={() => setSidebarOpen(true)}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/employee/notification")}
      />

      <main className="flex-1 overflow-y-auto px-[16px] pt-[8px] pb-[16px]">
        <p className="text-[14px] font-[600] leading-[20px] mb-[12px] text-left">
          {today.format("M월 D일")}
        </p>

        <WorkInfoCard todayShift={todayShift} onCheckIn={handleCheckIn} />
        <TasksCard todos={todos} onToggle={toggleTodo} />
        <MiniTimeline schedules={todaySchedules} />
      </main>

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

      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        storeName={activeStore.name}
        menuItems={sidebarMenuItems}
        storeList={storeList}
        activeStoreId={activeStore.storeId}
        onStoreChange={handleStoreChange}
        onMyPage={() => {
          setSidebarOpen(false);
          navigate("/employee/mypage");
        }}
        onLogout={handleLogout}
      />

      <AppOnlyModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </div>
  );
}

export default EmpHome;
