import api from "../api.js";

/**
 * 근무표 작성 요청 알림 전송
 * @param {number} storeId - 매장 ID (필수)
 * @param {string|number} month - 월 (YYYY-MM 형식 또는 숫자)
 * @param {Array<number>} employeeIds - 알바생 ID 배열 (선택, 백엔드에서 매장의 모든 직원에게 보낼 수도 있음)
 * @returns {Promise<Object>} 생성된 알림 정보
 */
/**
 * ⚠️ 이 함수는 사용되지 않습니다.
 * 알림은 /api/schedules/requests API 호출 시 백엔드에서 자동으로 생성됩니다.
 * 별도로 알림 API를 호출할 필요가 없습니다.
 * 
 * 만약 이 함수가 호출된다면, 빌드 캐시를 클리어하고 재배포하세요.
 */
export async function sendScheduleRequestNotification(storeId, month, employeeIds = null) {
  // 함수 호출 자체를 막기 위해 즉시 반환
  console.warn("⚠️ sendScheduleRequestNotification은 더 이상 사용되지 않습니다. 알림은 /api/schedules/requests에서 자동 생성됩니다.");
  return { success: true, message: "알림은 백엔드에서 자동 생성됩니다." };
}

