import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LogoImage from "../../../assets/Logo.jsx";
import HeaderMenu from "./HeaderMenu.jsx";
import CalAddIcon from "../../../assets/icons/CalendarAddIcon.jsx";
import BellIcon from "../../../assets/icons/BellIcon.jsx";
import { getActiveStore } from "../../../services/MypageService.js";
import { getMyWorkAvailability } from "../../../services/WorkAvailabilityService.js";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path.includes("/calendar") || path.includes("/cal")) {
      setSelectedMenu("캘린더생성");
    } else if (path.includes("/alarmHome")) {
      setSelectedMenu("알림");
    } else {
      setSelectedMenu("");
    }
  }, [location.pathname]);

  const handleMenuClick = async (menu) => {
    setSelectedMenu(menu);

    if (menu === "캘린더생성") {
      try {
        const activeStore = await getActiveStore();
        const isOwner = activeStore?.position === "OWNER";

        if (isOwner) {
          // 사장: 근무표 생성 상태 확인
          // 1. 생성하기를 눌렀는지 확인 (scheduleGenerationCompleted)
          // 2. 생성하기를 누르지 않고 ScheduleList에서 나간 경우 확인 (hasScheduleRequest)
          const isGenerationCompleted =
            localStorage.getItem("scheduleGenerationCompleted") === "true";
          const hasScheduleRequest =
            localStorage.getItem("hasScheduleRequest") === "true";

          console.log("🔍 Header - caladdicon 클릭:", {
            isGenerationCompleted,
            hasScheduleRequest,
            currentPath: location.pathname,
          });

          if (isGenerationCompleted) {
            // 생성하기를 눌렀을 경우: CalAdd로 이동하고 플래그 제거
            console.log("✅ 생성 완료 → CalAdd로 이동");
            localStorage.removeItem("scheduleGenerationCompleted");
            localStorage.removeItem("hasScheduleRequest");
            navigate("/calAdd");
          } else if (hasScheduleRequest) {
            // 생성하기를 누르지 않고 ScheduleList에서 나간 경우: ScheduleList로 이동
            console.log("✅ 생성 요청 있음 → ScheduleList로 이동");
            navigate("/scheduleList");
          } else {
            // 처음 시작하는 경우: CalAdd로 이동
            console.log("✅ 처음 시작 → CalAdd로 이동");
            navigate("/calAdd");
          }
        } else {
          // 알바: 근무표 제출 페이지로 이동 (최초 입력과 수정 모두 처리)
          navigate("/employee/schedule/modifying");
        }
      } catch (error) {
        console.error("캘린더 생성 페이지 이동 실패:", error);
        // 기본값으로 이동
        const fromEmployeeSection = location.pathname.startsWith("/employee");
        navigate(fromEmployeeSection ? "/employee/schedule/modifying" : "/calAdd");
      }
    }
    if (menu === "알림") {
      const fromEmployeeSection = location.pathname.startsWith("/employee");
      navigate(fromEmployeeSection ? "/alarmHomeEmp" : "/alarmHome");
    }
  };

  // 근무표 생성 요청 상태 확인 (사장용)
  const checkScheduleRequestStatus = () => {
    try {
      // localStorage에서 모든 알림 확인
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith("employee_notifications_")) {
          const notifications = JSON.parse(localStorage.getItem(key) || "[]");
          const hasRequest = notifications.some(
            (notif) => notif.type === "schedule_request" && !notif.read,
          );
          if (hasRequest) return true;
        }
      }
      return false;
    } catch (error) {
      console.error("근무표 생성 요청 상태 확인 실패:", error);
      return false;
    }
  };

  // work availability 확인 (알바용)
  const checkExistingAvailability = async () => {
    try {
      console.log("🔍 Header: work availability 확인 시작");
      const availabilityData = await getMyWorkAvailability();
      const list = Array.isArray(availabilityData)
        ? availabilityData
        : availabilityData?.availabilities || [];
      console.log("🔍 Header: getMyWorkAvailability 응답:", availabilityData);

      // availabilities가 배열이고 길이가 0보다 크면 true
      const hasAvailability = list.length > 0;
      console.log(
        "🔍 Header: availability 존재 여부:",
        hasAvailability,
        "개수:",
        list.length || 0,
      );

      return hasAvailability;
    } catch (error) {
      console.error("❌ Header: work availability 확인 실패:", error);
      console.error(
        "❌ Header: 에러 상세:",
        error.response?.data || error.message,
      );
      return false;
    }
  };

  return (
    <div className="w-full h-[60px] bg-white flex flex-row justify-between items-center p-5 shadow-[0_2px_7px_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center">
        <LogoImage
          onClick={() => {
            if (location.pathname.includes("owner")) navigate("/owner");
            else navigate("/employee");
          }}
        />
      </div>
      <div className="flex flex-row items-center gap-4">
        <HeaderMenu
          MenuIcon={<CalAddIcon />}
          onClick={() => handleMenuClick("캘린더생성")}
        />
        <HeaderMenu
          MenuIcon={<BellIcon />}
          onClick={() => handleMenuClick("알림")}
        />
      </div>
    </div>
  );
}

export default Header;
