import { Settings } from "lucide-react";
import useHomePage from "../../hooks/useHomePage.js";

import BellIcon from "../../assets/icons/BellIcon.jsx";
import BottomNav from "../../components/layout/BottomNav.jsx";
import HomeHeader from "../../components/home/HomeHeader.jsx";
import WorkInfoCard from "../../components/home/WorkInfoCard.jsx";
import TasksCard from "../../components/home/TasksCard.jsx";
import MiniTimeline from "../../components/home/MiniTimeline.jsx";
import HomeSidebar from "../../components/home/HomeSidebar.jsx";
import AppOnlyModal from "../../components/home/AppOnlyModal.jsx";

function OwnerHome() {
  const {
    today,
    activeStore,
    storeList,
    todaySchedules,
    todayShift,
    todos,
    toggleTodo,
    sidebarOpen,
    setSidebarOpen,
    isAppModalOpen,
    setIsAppModalOpen,
    handleCheckIn,
    handleStoreChange,
    handleLogout,
    navigate,
  } = useHomePage("owner");

  /* ── 사장님 전용: 사이드바 메뉴 ── */
  const sidebarMenuItems = [
    {
      label: "직원관리",
      onClick: () => {
        setSidebarOpen(false);
        navigate("/owner/manage");
      },
    },
    {
      label: "급여관리",
      onClick: () => {
        setSidebarOpen(false);
        /* TODO: 급여관리 페이지 라우트 연결 */
      },
    },
  ];

  const sidebarTitleExtra = (
    <div
      className="cursor-pointer p-[4px]"
      onClick={() => {
        setSidebarOpen(false);
        navigate("/owner/store-settings");
      }}
    >
      <Settings size={20} strokeWidth={1.5} color="black" />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      <HomeHeader
        storeName={activeStore.name}
        onMenuClick={() => setSidebarOpen(true)}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/owner/notification/home")}
      />

      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden px-[16px] pt-[8px] pb-[16px]">
        <p className="text-[14px] font-[600] leading-[20px] mb-[12px] text-left">
          {today.format("M월 D일")}
        </p>

        <WorkInfoCard todayShift={todayShift} onCheckIn={handleCheckIn} />
        <TasksCard todos={todos} onToggle={toggleTodo} />
        <MiniTimeline className="flex-1" schedules={todaySchedules} />
      </main>

      <BottomNav role="owner" activePage="home" />

      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        storeName={activeStore.name}
        titleExtra={sidebarTitleExtra}
        menuItems={sidebarMenuItems}
        storeList={storeList}
        activeStoreId={activeStore.storeId}
        onStoreChange={handleStoreChange}
        onMyPage={() => {
          setSidebarOpen(false);
          navigate("/owner/mypage");
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

export default OwnerHome;
