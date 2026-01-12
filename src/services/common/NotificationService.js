import api from "../api.js";

/**
 * 알림 조회 (GET /api/notifications)
 * 대타요청, 인력요청, 근무표 작성 요청 등 모든 알림을 통합 조회
 * @returns {Promise<Array>} 알림 목록 (type 필드로 구분: SCHEDULE_REQUEST, SHIFT_SWAP, STAFFING 등)
 */
export async function fetchNotifications() {
  try {
    console.log("🔔 알림 조회 API 호출: GET /api/notifications");
    const response = await api.get("/api/notifications");
    
    console.log("🔔 알림 조회 API 응답:", {
      status: response.status,
      data: response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
    });
    
    // 응답 데이터 정규화
    let notifications = response.data;
    
    // 응답이 배열이 아닌 경우 처리
    if (!Array.isArray(notifications)) {
      if (notifications && Array.isArray(notifications.data)) {
        notifications = notifications.data;
      } else if (notifications && Array.isArray(notifications.content)) {
        notifications = notifications.content;
      } else if (notifications && Array.isArray(notifications.notifications)) {
        notifications = notifications.notifications;
      } else if (notifications && Array.isArray(notifications.items)) {
        notifications = notifications.items;
      } else {
        console.warn("⚠️ 알림 응답이 배열 형식이 아닙니다:", notifications);
        notifications = [];
      }
    }
    
    console.log("🔔 정규화된 알림 목록:", notifications);
    return notifications;
  } catch (error) {
    console.error("❌ 알림 조회 실패:", error);
    console.error("❌ 알림 조회 실패 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

/**
 * 근무표 작성 요청 알림 생성 (POST /api/shift-swap/notifications)
 * 대타요청, 인력요청, 근무표 작성 요청 등 모든 알림을 통합 관리하는 API 사용
 * @param {Object} payload - 알림 데이터
 * @param {number} payload.storeId - 매장 ID
 * @param {Array<number>} payload.employeeIds - 알바생 ID 배열
 * @param {string} payload.message - 알림 메시지
 * @param {string} payload.startDate - 시작일자 (YYYY-MM-DD)
 * @param {string} payload.endDate - 종료일자 (YYYY-MM-DD)
 * @param {boolean} payload.unitSpecified - 시간 단위 지정 여부
 * @param {Array} payload.timeSlots - 시간 슬롯 배열 (unitSpecified가 true인 경우)
 * @param {number} payload.minWorkTime - 최소 근무시간 (unitSpecified가 false인 경우)
 * @param {string} payload.type - 알림 타입 (선택, 백엔드에서 자동 설정될 수 있음)
 * @returns {Promise<Object>} 생성된 알림 정보
 */
/**
 * ⚠️ 이 함수는 사용되지 않습니다.
 * 알림은 /api/schedules/requests API 호출 시 백엔드에서 자동으로 생성됩니다.
 * 별도로 알림 API를 호출할 필요가 없습니다.
 * 
 * 만약 이 함수가 호출된다면, 빌드 캐시를 클리어하고 재배포하세요.
 */
export async function createScheduleRequestNotification(payload) {
  // 함수 호출 자체를 막기 위해 즉시 반환
  console.warn("⚠️ createScheduleRequestNotification은 더 이상 사용되지 않습니다. 알림은 /api/schedules/requests에서 자동 생성됩니다.");
  return { success: true, message: "알림은 백엔드에서 자동 생성됩니다." };
}

