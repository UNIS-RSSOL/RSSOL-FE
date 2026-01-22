import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import NavBar from "../../../components/common/alarm/NavBar";
import AlarmItem from "../../../components/common/alarm/AlarmItem";
import { fetchAlarm } from "../../../services/common/AlarmService.js";
import dayjs from "dayjs";
import { formatTimeAgo } from "../../../utils/timeUtils.js";

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
    <div className="w-full h-full flex flex-col">
      <TopBar title="알림" onBack={() => navigate("/owner")} />
      <NavBar currentTab={tab} setCurrentTab={setTab} />
      <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
        <div className="px-4 mt-4 text-[15px] font-semibold text-left">
          {today}
        </div>
        <div className="mt-2 flex flex-col gap-1">
          {alarms.map((alarm, index) => {
            const type =
              alarm.type === "SHIFT_SWAP_NOTIFY_MANAGER" ||
              alarm.type === "EXTRA_SHIFT_NOTIFY_MANAGER"
                ? 3
                : alarm.type === "SHIFT_SWAP_REQUEST" ||
                    alarm.type === "EXTRA_SHIFT_REQUEST_INVITE"
                  ? 2
                  : 1;
            const time = formatTimeAgo(alarm.createdAt);
            return (
              <AlarmItem
                key={index}
                alarmType={type}
                img={alarm.profileImageUrl}
                storename={alarm.storeName}
                time={time}
                id={alarm.shiftSwapRequestId || alarm.extraShiftRequestId}
                status={alarm.shiftSwapStatus || alarm.extraShiftStatus}
                approval={alarm.shiftSwapManagerApprovalStatus}
                owner={false}
              >
                {alarm.message}
              </AlarmItem>
            );
          })}
        </div>
      </div>
    </div>
  );
}
export default AlarmHome;
