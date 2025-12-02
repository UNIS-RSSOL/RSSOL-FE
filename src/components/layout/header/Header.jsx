import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HeaderMenu from "./HeaderMenu.jsx";
import CalAddIcon from "../../../assets/icons/CalAddIcon.jsx";
import AlarmIcon from "../../../assets/icons/AlarmIcon.jsx";
import { LogoImage } from "../../../assets/icons/logo.jsx";

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

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);

    if (menu === "캘린더생성") {
      const fromEmployeeSection = location.pathname.startsWith("/employee");
      navigate(fromEmployeeSection ? "/calAddEmp" : "/calAdd");
    }
    if (menu === "알림") {
      const fromEmployeeSection = location.pathname.startsWith("/employee");
      navigate(fromEmployeeSection ? "/alarmHomeEmp" : "/alarmHome");
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
