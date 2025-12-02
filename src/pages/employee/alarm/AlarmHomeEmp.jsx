import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TopBar from "../../../components/layout/alarm/TopBar";
import AlarmItem from "../../../components/layout/alarm/AlarmItem";
import ActionButtons from "../../../components/layout/alarm/ActionButtons";
import { fetchMydata } from "../../../services/employee/MyPageService.js";
import { getNotifications, deleteNotification, formatTimeAgo } from "../../../utils/notificationUtils.js";
import dayjs from "dayjs";
import "dayjs/locale/ko";

function AlarmHomeEmp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 알바생 정보 및 알림 로드
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const mydata = await fetchMydata();
        if (mydata) {
          // 알바생 ID 추출 (여러 가능한 필드 확인)
          const id = mydata.userId || mydata.id || mydata.employeeId;
          if (id) {
            setEmployeeId(id);
            const notificationList = getNotifications(id);
            // 최신순으로 정렬
            const sorted = notificationList.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            setNotifications(sorted);
          }
        }
      } catch (error) {
        console.error("알림 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // 알림 삭제 핸들러
  const handleDelete = (notificationId) => {
    if (!employeeId) return;
    deleteNotification(employeeId, notificationId);
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  // 알림을 날짜별로 그룹화
  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const dateKey = dayjs(date).locale("ko").format("MM.DD(ddd)");
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(notification);
    });
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
        <TopBar title="알림" onBack={() => navigate("/employee")} />
        <div className="px-4 mt-4 text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
      <TopBar title="알림" onBack={() => navigate("/employee")} />

      {notifications.length === 0 ? (
        <div className="px-4 mt-4 text-center text-gray-400">알림이 없습니다.</div>
      ) : (
        Object.entries(groupedNotifications).map(([dateKey, dateNotifications]) => (
          <div key={dateKey}>
            <div className="px-4 mt-4 text-[15px] font-semibold">{dateKey}</div>
            <div className="mt-2">
              {dateNotifications.map((notification) => (
                <AlarmItem
                  key={notification.id}
                  icon={<div className="w-full h-full bg-gray-200 rounded-full"></div>}
                  title={notification.storeName || "매장"}
                  time={formatTimeAgo(notification.createdAt)}
                >
                  {notification.message}
                  {notification.type === 'schedule_request' && (
                    <ActionButtons 
                      leftLabel="거절" 
                      rightLabel="추가하기" 
                      onLeftClick={() => handleDelete(notification.id)}
                      onRightClick={() => {
                        handleDelete(notification.id);
                        navigate("/calAddEmp");
                      }} 
                    />
                  )}
                </AlarmItem>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
export default AlarmHomeEmp;
