import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TopBar from "../../../components/layout/alarm/TopBar";
import NavBar from "../../../components/layout/alarm/NavBar";
import AlarmItem from "../../../components/layout/alarm/AlarmItem";

import { fetchAlarm } from "../../../services/common/AlarmService.js";
import dayjs from "dayjs";
import { formatTimeAgo } from "../../../utils/timeUtils";

function AlarmHome() {
  const today = dayjs().format("MM.DD(dd)");
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchAlarm();
        setAlarms(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
      <TopBar title="알림" onBack={() => navigate("/owner")} />
      <NavBar currentTab={tab} setCurrentTab={setTab} />

      <div className="px-4 mt-4 text-[15px] font-semibold text-left">
        {today}
      </div>
      <div className="mt-2">
        {alarms.map((alarm) => {
          const type =
            alarm.type === "SHIFT_SWAP_NOTIFY_MANAGER"
              ? 3
              : alarm.type === "SHIFT_SWAP_REQUEST"
                ? 2
                : 1;
          const time = formatTimeAgo(alarm.createdAt);
          return (
            <AlarmItem
              alarmType={type}
              storename="맥도날드 신촌점" //어느매장에서 온 알림인지 알려주는게 없어서 백 쪽에 요청해야됨
              time={time}
            >
              {alarm.message}
            </AlarmItem>
          );
        })}
      </div>
    </div>
  );
}
export default AlarmHome;
