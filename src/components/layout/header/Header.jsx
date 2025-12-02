import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderMenu from "./HeaderMenu.jsx";
import CalAddIcon from "../../../assets/icons/CalAddIcon.jsx";
import AlarmIcon from "../../../assets/icons/AlarmIcon.jsx";
import { LogoImage } from "../../../assets/icons/logo.jsx";
import { fetchActiveStore } from "../../../services/owner/MyPageService.js";
import { fetchMyAvailabilities } from "../../../services/employee/ScheduleService.js";

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
        const activeStore = await fetchActiveStore();
        const isOwner = activeStore?.position === "OWNER";

        if (isOwner) {
          // 사장: 근무표 생성 요청 상태 확인
          // localStorage의 알림을 확인하거나, generateSchedule의 unsubmittedEmployeeIds 확인
          // 간단하게는 localStorage의 알림을 확인
          const hasScheduleRequest = checkScheduleRequestStatus();
          
          if (hasScheduleRequest) {
            navigate("/scheduleList");
          } else {
            navigate("/calAdd");
          }
        } else {
          // 알바: work availability가 있는지 확인
          const hasAvailability = await checkExistingAvailability();
          
          if (hasAvailability) {
            navigate("/calModEmp");
          } else {
            navigate("/calAddEmp");
          }
        }
      } catch (error) {
        console.error("캘린더 생성 페이지 이동 실패:", error);
        // 기본값으로 이동
        const fromEmployeeSection = location.pathname.startsWith("/employee");
        navigate(fromEmployeeSection ? "/calAddEmp" : "/calAdd");
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
            (notif) => notif.type === "schedule_request" && !notif.read
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
      const availabilities = await fetchMyAvailabilities();
      // availabilities가 배열이고 길이가 0보다 크면 true
      return availabilities && Array.isArray(availabilities) && availabilities.length > 0;
    } catch (error) {
      console.error("work availability 확인 실패:", error);
      return false;
    }
  };

  return (
    <div className="w-full h-[60px] bg-white flex flex-row justify-between items-center p-5 shadow-[0_2px_7px_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center">
        <LogoImage />
      </div>
      <div className="flex flex-row items-center gap-4">
        <HeaderMenu
          MenuIcon={<CalAddIcon />}
          onClick={() => handleMenuClick("캘린더생성")}
        />
        <HeaderMenu
          MenuIcon={<AlarmIcon />}
          onClick={() => handleMenuClick("알림")}
        />
      </div>
    </div>
  );
}

export default Header;
