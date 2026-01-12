import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import TopBar from "../../../components/layout/alarm/TopBar";
import AlarmItem from "../../../components/layout/alarm/AlarmItem";
import ActionButtonsGen from "../../../components/layout/alarm/ActionButtonsGen";
import { fetchMydata } from "../../../services/employee/MyPageService.js";
import { fetchNotifications } from "../../../services/common/NotificationService.js";
import { formatTimeAgo } from "../../../utils/notificationUtils.js";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import defaultProfile from "../../../assets/images/EmpBtn.png";

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
          }
        }

        // 백엔드 API로 알림 조회
        const notificationList = await fetchNotifications();
        
        console.log("🔔 알림 API 응답:", notificationList);
        console.log("🔔 알림 API 응답 타입:", typeof notificationList, Array.isArray(notificationList));
        
        // 백엔드 응답 형식에 맞게 변환 (응답이 배열이거나 객체일 수 있음)
        let notifications = [];
        if (Array.isArray(notificationList)) {
          notifications = notificationList;
        } else if (notificationList && Array.isArray(notificationList.data)) {
          notifications = notificationList.data;
        } else if (notificationList && notificationList.content) {
          notifications = notificationList.content;
        } else if (notificationList && notificationList.notifications) {
          notifications = notificationList.notifications;
        }

        console.log("🔔 파싱된 알림 목록:", notifications);
        console.log("🔔 알림 개수:", notifications.length);

        // 최신순으로 정렬 (createdAt 또는 createdAt 필드 기준)
        const sorted = notifications.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || a.createdDate || 0);
          const dateB = new Date(b.createdAt || b.created_at || b.createdDate || 0);
          return dateB - dateA;
        });
        
        setNotifications(sorted);
      } catch (error) {
        console.error("알림 로드 실패:", error);
        console.error("알림 로드 실패 상세:", error.response?.data || error.message);
        setNotifications([]); // 에러 시 빈 배열로 설정
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // 알림 삭제 핸들러 (백엔드 API로 삭제하는 경우 추가 가능)
  const handleDelete = (notificationId) => {
    // TODO: 백엔드에 DELETE API가 있다면 호출
    // 현재는 프론트엔드에서만 제거
    setNotifications(notifications.filter(n => 
      (n.id !== notificationId && n.notificationId !== notificationId)
    ));
  };

  // 알림을 날짜별로 그룹화
  const groupNotificationsByDate = (notifications) => {
    const groups = {};
    notifications.forEach(notification => {
      const dateStr = notification.createdAt || notification.created_at || notification.createdDate;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
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
              {dateNotifications.map((notification) => {
                const profileImageUrl = notification.profileImageUrl || notification.profile_image_url || null;
                const displayImage = profileImageUrl ? profileImageUrl : defaultProfile;
                
                return (
                <AlarmItem
                  key={notification.id || notification.notificationId || notification.notification_id}
                  icon={
                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={displayImage} 
                        alt="profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  }
                  title={notification.storeName || notification.store_name || "매장"}
                  time={formatTimeAgo(notification.createdAt || notification.created_at || notification.createdDate)}
                >
                  {notification.message || notification.content || notification.text || notification.description}
                  {/* 알림 타입별 액션 버튼 표시 */}
                  {(() => {
                    // 알림 타입 확인 (다양한 필드명 지원)
                    const notificationType = 
                      notification.type || 
                      notification.notificationType || 
                      notification.notification_type ||
                      notification.notificationTypeEnum ||
                      notification.category;
                    
                    console.log("🔔 알림 타입:", notificationType, "전체 알림:", notification);
                    
                    // 1. 근무표 입력 요청 알림 (SCHEDULE_INPUT_REQUEST 등)
                    const isScheduleInputRequest = 
                      notificationType === 'SCHEDULE_INPUT_REQUEST' ||
                      notificationType === 'schedule_input_request' || 
                      notificationType === 'SCHEDULE_REQUEST' ||
                      notificationType === 'schedule_request' || 
                      notificationType === 'SCHEDULE_REQUEST_NOTIFICATION' ||
                      notificationType === 'ScheduleRequest';
                    
                    // 2. 대타 요청 알림 (SHIFT_SWAP, SHIFT_SWAP_REQUEST 등)
                    const isShiftSwap = 
                      notificationType === 'SHIFT_SWAP' ||
                      notificationType === 'shift_swap' ||
                      notificationType === 'SHIFT_SWAP_REQUEST' ||
                      notificationType === 'ShiftSwap';
                    
                    // 3. 인력 요청 알림 (EXTRA_SHIFT, STAFFING_REQUEST 등)
                    const isExtraShift = 
                      notificationType === 'EXTRA_SHIFT' ||
                      notificationType === 'extra_shift' ||
                      notificationType === 'STAFFING_REQUEST' ||
                      notificationType === 'STAFFING' ||
                      notificationType === 'ExtraShift';
                    
                    // 근무표 입력 요청 알림: "추가하기" 버튼 하나만 표시
                    if (isScheduleInputRequest) {
                      return (
                        <ActionButtonsGen
                          label="추가하기"
                          onClick={() => {
                            navigate("/calModEmp");
                          }}
                        />
                      );
                    }
                    
                    // 대타 요청이나 인력 요청 알림의 경우 수락/거절 버튼 표시 (필요시)
                    if (isShiftSwap || isExtraShift) {
                      // 필요시 수락/거절 버튼 추가 가능
                      return null;
                    }
                    
                    return null;
                  })()}
                </AlarmItem>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
export default AlarmHomeEmp;
