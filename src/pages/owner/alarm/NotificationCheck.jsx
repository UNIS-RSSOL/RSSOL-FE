import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TopBar from "../../../components/layout/header/TopBar.jsx";
import NavBar from "../../../components/common/notification/NavBar.jsx";
import NotificationItem from "../../../components/common/notification/NotificationItem.jsx";
import { getNotification } from "../../../services/new/NotificationService.js";
import dayjs from "dayjs";
import { formatTimeAgo } from "../../../utils/timeUtils.js";

function NotificationCheck() {
  const today = dayjs().format("MM.DD(dd)");
  const navigate = useNavigate();
  const [tab, setTab] = useState("final");
  const [alarms, setAlarms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getNotification();
        const filteredAlarms = response.filter(
          (alarm) =>
            alarm.type === "SHIFT_SWAP_NOTIFY_MANAGER" ||
            alarm.type === "EXTRA_SHIFT_NOTIFY_MANAGER",
        );
        setAlarms(filteredAlarms);
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
            const time = formatTimeAgo(alarm.createdAt);
            return (
              <NotificationItem
                key={index}
                alarmType={3}
                img={alarm.profileImageUrl}
                storename={alarm.storeName}
                time={time}
                id={alarm.shiftSwapRequestId || alarm.extraShiftRequestId}
                status={alarm.shiftSwapStatus || alarm.extraShiftStatus}
                approval={alarm.shiftSwapManagerApprovalStatus}
                owner={false}
              >
                {alarm.message}
              </NotificationItem>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NotificationCheck;
