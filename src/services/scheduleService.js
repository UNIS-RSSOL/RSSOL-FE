import api from "./api";

/**
 * 날짜 지정함 - 근무표 확정
 * @param {string} candidateKey - 후보 스케줄 키 (예: "candidate_schedule:store:1:week:2025-W43-4")
 * @param {number} index - 후보 스케줄 인덱스
 * @param {string} startDate - 시작일자 (예: "2025-10-23")
 * @param {string} endDate - 마무리일자 (예: "2025-10-29")
 * @returns {Promise<{message: string, scheduleId: number, status: string}>}
 */
export const confirmSchedule = async (candidateKey, index, startDate, endDate) => {
  try {
    const response = await api.post("/api/schedules/confirm", {
      candidateKey,
      index,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("근무표 확정 실패:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 날짜 지정하지 않음 - 근무표 생성 (최소 근무시간으로 나눈 경우)
 * @param {number} storeId - 매장 ID
 * @param {string} openTime - 오픈 시간 (예: "09:00:00")
 * @param {string} closeTime - 마감 시간 (예: "22:00:00")
 * @param {Array<{startTime: string, endTime: string, requiredStaff: number}>} timeSegments - 시간 구간 배열
 * @param {Object} generationOptions - 생성 옵션
 * @param {number} generationOptions.candidateCount - 후보 개수
 * @returns {Promise<{
 *   status: string,
 *   scheduleSettingsId: number,
 *   storeId: number,
 *   timeSegments: Array<{id: number, startTime: string, endTime: string, requiredStaff: number}>,
 *   candidateScheduleKey: string,
 *   generatedCount: number,
 *   unsubmittedEmployeeIds: number[] | null
 * }>}
 */
export const generateSchedule = async (
  storeId,
  openTime,
  closeTime,
  timeSegments,
  generationOptions = { candidateCount: 5 }
) => {
  try {
    const response = await api.post("/api/schedules/generate", {
      storeId,
      openTime,
      closeTime,
      timeSegments,
      generationOptions,
    });
    return response.data;
  } catch (error) {
    console.error("근무표 생성 실패:", error.response?.data || error.message);
    throw error;
  }
};

