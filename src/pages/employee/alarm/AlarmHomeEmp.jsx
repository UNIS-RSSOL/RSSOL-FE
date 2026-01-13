import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TopBar from "../../../components/common/alarm/TopBar";
import { formatTimeAgo } from "../../../utils/notificationUtils.js";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { fetchAlarm } from "../../../services/common/AlarmService.js";
import AlarmItem from "../../../components/common/alarm/AlarmItem.jsx";

function AlarmHomeEmp() {
  const navigate = useNavigate();
  const today = dayjs().format("MM.DD(dd)");
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchAlarm();
        setAlarms(response);
      } catch (error) {
        console.error("알림 조회 실패:", error);
      }
    })();
  }, []);

  return (
    <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
      <TopBar title="알림" onBack={() => navigate("/employee")} />
      <div className="px-4 mt-4 text-[15px] font-semibold text-left">
        {today}
      </div>
      <div className="mt-2">
        {alarms.map((alarm, index) => {
          const type =
            alarm.type === "SHIFT_SWAP_REQUEST" ||
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
              id={
                alarm.type === "SHIFT_SWAP_REQUEST"
                  ? alarm.shiftSwapRequestId
                  : alarm.type === "EXTRA_SHIFT_REQUEST_INVITE"
                    ? alarm.extraShiftRequestId
                    : null
              }
              status={alarm.shiftSwapStatus || alarm.extraShiftStatus}
            >
              {alarm.message}
            </AlarmItem>
          );
        })}
      </div>
    </div>
  );
}
export default AlarmHomeEmp;
