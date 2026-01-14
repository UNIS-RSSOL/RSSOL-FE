import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function NavBar({ currentTab, setCurrentTab }) {
  const navigate = useNavigate();

  useEffect(() => {}, [currentTab]);

  const handleTabClick = (tab) => {
    setCurrentTab(tab);

    if (tab === "all") navigate("/alarmHome"); // AlarmHome.jsx
    if (tab === "final") navigate("/alarmCheck"); // AlarmCheck.jsx
  };

  return (
    <div className="flex w-full h-[44px] bg-white border-b border-gray-200 text-[15px] font-medium">
      <div
        onClick={() => handleTabClick("all")}
        className={`flex-1 flex items-center justify-center cursor-pointer relative ${
          currentTab === "all" ? "text-black" : "text-gray-400"
        }`}
      >
        전체 알림
        {currentTab === "all" && (
          <div className="absolute bottom-0 h-[3px] w-full bg-[#68E194]"></div>
        )}
      </div>

      <div
        onClick={() => handleTabClick("final")}
        className={`flex-1 flex items-center justify-center cursor-pointer relative ${
          currentTab === "final" ? "text-black" : "text-gray-400"
        }`}
      >
        최종 승인
        {currentTab === "final" && (
          <div className="absolute bottom-0 h-[3px] w-full bg-[#68E194]"></div>
        )}
      </div>
    </div>
  );
}

export default NavBar;
