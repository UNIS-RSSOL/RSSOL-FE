import { Settings } from "lucide-react";
import useHomePage from "../../hooks/useHomePage.js";
import { useNavigate } from "react-router-dom";
import BellIcon from "../../assets/icons/BellIcon.jsx";
import Footer from "../../components/layout/footer/Footer.jsx";
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
    attendance,
    handleCheckIn,
    handleCheckOut,
    handleStoreChange,
    handleLogout,
    navigate,
  } = useHomePage("owner");

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

        <WorkInfoCard
          todayShift={todayShift}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          attendance={attendance}
        />
        <TasksCard todos={todos} onToggle={toggleTodo} />
        <MiniTimeline className="flex-1" schedules={todaySchedules} />
      </main>

      <Footer />

      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        storeName={activeStore.name}
        titleExtra={sidebarTitleExtra}
        storeList={storeList}
        activeStoreId={activeStore.storeId}
        onStoreChange={handleStoreChange}
        onMyPage={() => {
          setSidebarOpen(false);
          navigate("/owner/mypage");
        }}
        onLogout={handleLogout}
        setSidebarOpen={setSidebarOpen}
        role="OWNER"
      />

      <AppOnlyModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </div>
  );
}

export default OwnerHome;
