import api from "./api.js";

/**
 * 시간 문자열을 LocalTime 객체로 변환
 * API 스펙에 따라 { hour, minute, second, nano } 형식으로 변환
 * @param {string} timeStr - 시간 문자열 (예: "09:00:00" 또는 "09:00")
 * @returns {{hour: number, minute: number, second: number, nano: number}}
 */
const parseTimeToLocalTime = (timeStr) => {
  // "09:00:00" 또는 "09:00" 형식 파싱
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0] || '0', 10);
  const minute = parseInt(parts[1] || '0', 10);
  const second = parseInt(parts[2] || '0', 10);
  
  // API 스펙에 맞는 객체 형식 반환
  return {
    hour,
    minute,
    second,
    nano: 0
  };
};

/**
 * 근무표 생성 요청 및 설정 저장 (POST /api/schedules/requests)
 * CalAdd에서 "근무표 생성 요청하기" 버튼 클릭 시 사용
 * 
 * 요청 body 스펙:
 * {
 *   "openTime": { hour, minute, second, nano },
 *   "closeTime": { hour, minute, second, nano },
 *   "startDate": "YYYY-MM-DD",
 *   "endDate": "YYYY-MM-DD",
 *   "timeSegments": [
 *     {
 *       "startTime": { hour, minute, second, nano },
 *       "endTime": { hour, minute, second, nano },
 *       "requiredStaff": number
 *     }
 *   ]
 * }
 * 
 * @param {Object} requestData - 요청 데이터
 * @param {string} requestData.openTime - 오픈 시간 문자열 (예: "09:00:00")
 * @param {string} requestData.closeTime - 마감 시간 문자열 (예: "22:00:00")
 * @param {string} requestData.startDate - 시작일자 (YYYY-MM-DD)
 * @param {string} requestData.endDate - 종료일자 (YYYY-MM-DD)
 * @param {Array<{startTime: string, endTime: string, requiredStaff: number}>} requestData.timeSegments - 시간 구간 배열
 * @returns {Promise<{settingId: number, ...}>} 생성된 설정 정보
 */
export const createScheduleRequest = async (requestData) => {
  try {
    console.log("📥 scheduleService - 받은 requestData:", JSON.stringify(requestData, null, 2));
    console.log("📥 scheduleService - requestData.storeId:", requestData.storeId);
    
    // ⚠️ storeId 필수 검증
    if (!requestData.storeId) {
      const errorMsg = "storeId는 필수입니다. 매장 정보를 확인해주세요.";
      console.error("❌ storeId 누락:", errorMsg);
      throw new Error(errorMsg);
    }

    // ⚠️ 백엔드가 LocalTime을 문자열 형식("HH:mm:ss")으로 받아야 함
    // 객체 형식 {hour, minute, second, nano}은 JSON 파싱 에러 발생
    // 시간 문자열을 그대로 전송 (이미 "HH:mm:ss" 형식으로 전달됨)
    const formattedData = {
      storeId: requestData.storeId, // ⚠️ 필수: 알림 생성 시 필요 (camelCase로 전송)
      openTime: requestData.openTime, // "09:00:00" 형식 문자열
      closeTime: requestData.closeTime, // "18:00:00" 형식 문자열
      startDate: requestData.startDate,
      endDate: requestData.endDate,
    };

    // timeSegments 변환 - 시간도 문자열로 전송
    if (requestData.timeSegments && Array.isArray(requestData.timeSegments) && requestData.timeSegments.length > 0) {
      formattedData.timeSegments = requestData.timeSegments.map(segment => ({
        startTime: segment.startTime, // "09:00:00" 형식 문자열
        endTime: segment.endTime, // "13:00:00" 형식 문자열
        requiredStaff: segment.requiredStaff,
      }));
    }

    console.log("📤 scheduleService - 전송할 formattedData:", JSON.stringify(formattedData, null, 2));

    const response = await api.post("/api/schedules/requests", formattedData);
    
    console.log("✅ 근무표 생성 요청 성공:", {
      status: response.status,
      data: response.data,
    });
    
    // 백엔드에서 알림이 자동으로 생성되는지 확인
    console.log("🔔 근무표 생성 요청 완료 - 백엔드에서 직원들에게 알림이 자동 생성됩니다.");
    
    return response.data;
  } catch (error) {
    console.error("근무표 생성 요청 실패:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 설정 ID로 근무표 생성 (POST /api/schedules/{settingId}/generate)
 * ScheduleList에서 "생성하기" 버튼 클릭 시 사용
 * @param {number} settingId - 설정 ID
 * @param {Object} generationOptions - 생성 옵션
 * @param {number} generationOptions.candidateCount - 후보 개수 (기본값: 5)
 * @returns {Promise<{
 *   candidateScheduleKey: string,
 *   generatedCount: number,
 *   ...
 * }>} 생성된 근무표 후보 정보
 */
export const generateScheduleWithSetting = async (settingId, generationOptions = { candidateCount: 5 }) => {
  try {
    const response = await api.post(`/api/schedules/${settingId}/generate`, {
      generationOptions,
    });
    return response.data;
  } catch (error) {
    console.error("근무표 생성 실패:", error.response?.data || error.message);
    throw error;
  }
};

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

/**
 * 후보 스케줄 조회
 * @param {string} candidateKey - 후보 스케줄 키
 * @param {number} index - 후보 스케줄 인덱스
 * @returns {Promise<Array<{id: number, userStoreId: number, userName: string, startDatetime: string, endDatetime: string}>>}
 */
export const fetchCandidateSchedule = async (candidateKey, index) => {
  try {
    const response = await api.get(`/api/schedules/candidate/${candidateKey}/${index}`);
    return response.data;
  } catch (error) {
    console.error("후보 스케줄 조회 실패:", error.response?.data || error.message);
    throw error;
  }
};

