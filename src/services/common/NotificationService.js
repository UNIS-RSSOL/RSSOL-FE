import api from "../api.js";

/**
 * 알림 조회 (GET /api/shift-swap/notifications)
 * 대타요청, 인력요청, 근무표 작성 요청 등 모든 알림을 통합 조회
 * @returns {Promise<Array>} 알림 목록 (type 필드로 구분: SCHEDULE_REQUEST, SHIFT_SWAP, STAFFING 등)
 */
export async function fetchNotifications() {
  try {
    const response = await api.get("/api/shift-swap/notifications");
    return response.data;
  } catch (error) {
    console.error("알림 조회 실패:", error);
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
export async function createScheduleRequestNotification(payload) {
  try {
    // 백엔드 API 스펙에 맞게 요청 데이터 구성
    const requestData = {
      storeId: payload.storeId,
      employeeIds: payload.employeeIds,
      message: payload.message,
      startDate: payload.startDate,
      endDate: payload.endDate,
      unitSpecified: payload.unitSpecified,
      timeSlots: payload.timeSlots,
      minWorkTime: payload.minWorkTime,
      // 알림 타입 (백엔드에서 자동 설정할 수도 있음)
      type: payload.type || 'SCHEDULE_REQUEST',
    };

    // POST /api/shift-swap/notifications - 통합 알림 API
    const response = await api.post("/api/shift-swap/notifications", requestData);
    return response.data;
  } catch (error) {
    console.error("알림 생성 실패:", error);
    throw error;
  }
}

