import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TopBar from "../../../components/layout/alarm/TopBar";
import NavBar from "../../../components/layout/alarm/NavBar";
import AlarmItem from "../../../components/layout/alarm/AlarmItem";
import ActionButtons from "../../../components/layout/alarm/ActionButtons";
import { fetchAlarm } from "../../../services/common/AlarmService";
import dayjs from "dayjs";

function AlarmHome() {
  const today = dayjs().format("MM.DD(dd)");
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    async () => {
      try {
        const response = await fetchAlarm();
      } catch (error) {
        console.error(error);
      }
    };
  });

  return (
    <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
      <TopBar title="알림" onBack={() => navigate("/owner")} />
      <NavBar currentTab={tab} setCurrentTab={setTab} />

      <div className="px-4 mt-4 text-[15px] font-semibold text-left">
        {today}
      </div>
      <div className="mt-2">
        <AlarmItem
          alarmType={2}
          storename="맥도날드 신촌점"
          time="10분 전"
          children="‘김혜민’님이 15(월) 13:00~16:00 근무를 부탁했어요!"
        />
      </div>
    </div>
  );
}
export default AlarmHome;
