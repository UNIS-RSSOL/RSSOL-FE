//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//근무표 생성(날짜 지정X)
export const generateSchedule = async (
  storeId,
  openTime,
  closeTime,
  timeSegments,
  generationOptions = { candidateCount: 5 },
) => {
  try {
    const response = await api.post("schedules/generate", {
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

//근무표 생성(타임으로 나눔)
export const generateScheduleByTime = async (scheduleRequestId, candidateCount) => {
  try {
    const response = await api.post(`schedules/requests/${scheduleRequestId}/generate`, {
      generationOptions: { candidateCount },
    });
    return response.data;
  } catch (error) {
    console.error("근무표 생성 실패:", error);
    throw error;
  }
};

//근무표 생성 요청(근무자들에게 입력받기)
export const requestScheduleInput = async (
  storeId,
  openTime,
  closeTime,
  startDate,
  endDate,
  timeSegments,
) => {
  try {
    const requestBody = {
      storeId,
      openTime,
      closeTime,
      startDate,
      endDate,
      timeSegments,
    };
    
    console.log("📤 근무표 생성 요청 전송:", {
      endpoint: "schedules/requests",
      data: requestBody,
    });
    
    const response = await api.post(`schedules/requests`, requestBody);
    
    console.log("✅ 근무표 생성 요청 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 근무표 생성 요청 실패:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
      requestData: error.config?.data,
      responseData: error.response?.data,
    });
    throw error;
  }
};

//생성된 근무표들(임시) 조회
export const getScheduleCandidate = async (key, index) => {
  try {
    const response = await api.get("schedules/candidates", {
      params: {
        key,
        index,
      },
    });
    return response.data;
  } catch (error) {
    console.error("근무표 조회 실패:", error);
    throw error;
  }
};

//근무표 지정
export const confirmSchedule = async (
  scheduleRequestId,
  candidateKey,
  index,
  startDate,
  endDate,
) => {
  try {
    const response = await api.post(`schedules/requests/${scheduleRequestId}/confirm`, {
      candidateKey,
      index,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("근무표 지정 실패:", error);
    throw error;
  }
};

//근무 가능 시간 제출 상태 조회
export const getSubmissionStatus = async (storeId) => {
  try {
    const response = await api.get(`schedules/requests/${storeId}/submission-status`);
    return response.data;
  } catch (error) {
    console.error("제출 상태 조회 실패:", error);
    throw error;
  }
};
