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
    // timeSlots 형식 변환 (프론트엔드 형식 -> 백엔드 형식)
    let formattedTimeSlots = null;
    if (payload.timeSlots && Array.isArray(payload.timeSlots) && payload.timeSlots.length > 0) {
      formattedTimeSlots = payload.timeSlots.map((slot) => {
        // 이미 백엔드 형식인 경우 (startTime, endTime, requiredStaff)
        if (slot.startTime && slot.endTime !== undefined && slot.requiredStaff !== undefined) {
          return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            requiredStaff: slot.requiredStaff,
          };
        }
        // 프론트엔드 형식인 경우 (start, end, count) -> 백엔드 형식으로 변환
        if (slot.start && slot.end && slot.count !== undefined) {
          return {
            startTime: slot.start.includes(':') ? `${slot.start}:00` : slot.start,
            endTime: slot.end.includes(':') ? `${slot.end}:00` : slot.end,
            requiredStaff: slot.count,
          };
        }
        return slot; // 변환 불가능한 경우 원본 반환
      });
    }

    // 백엔드 API 스펙에 맞게 요청 데이터 구성
    // null 값은 제거하거나 백엔드가 기대하는 형식으로 변환
    const requestData = {
      storeId: payload.storeId,
      employeeIds: payload.employeeIds,
      message: payload.message,
      unitSpecified: payload.unitSpecified,
      type: payload.type || 'SCHEDULE_REQUEST',
    };

    // 조건부 필드 추가 (null이 아닌 경우만)
    if (payload.startDate) {
      requestData.startDate = payload.startDate;
    }
    if (payload.endDate) {
      requestData.endDate = payload.endDate;
    }
    if (formattedTimeSlots && formattedTimeSlots.length > 0) {
      requestData.timeSlots = formattedTimeSlots;
    }
    if (payload.minWorkTime !== null && payload.minWorkTime !== undefined) {
      requestData.minWorkTime = payload.minWorkTime;
    }

    console.log("📤 알림 생성 요청 데이터:", requestData);

    // POST /api/notifications/schedule-request - 근무표 작성 요청 알림 API
    // /api/shift-swap/notifications는 POST를 지원하지 않음 (GET만 지원)
    const response = await api.post("/api/notifications/schedule-request", requestData);
    return response.data;
  } catch (error) {
    console.error("알림 생성 실패:", error);
    console.error("요청 데이터:", payload);
    if (error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
    }
    throw error;
  }
}

