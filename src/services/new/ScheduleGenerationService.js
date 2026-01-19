//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//근무표 생성(타임으로 나눔)
export const generateScheduleByTime = async (settingId, candidateCount) => {
  try {
    const response = await api.post(`schedules/${settingId}/generate`, {
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
  openTime,
  closeTime,
  startDate,
  endDate,
  timeSegments,
) => {
  try {
    const response = await api.post(`schedules/requests`, {
      openTime,
      closeTime,
      startDate,
      endDate,
      timeSegments,
    });
    return response.data;
  } catch (error) {
    console.error("근무표 생성 요청 실패:", error);
    throw error;
  }
};

//생성된 근무표들(임시) 조회
export const getScheduleCandidate = async (key) => {
  try {
    const response = await api.get("schedules/candidates", {
      params: {
        key,
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
  candidateKey,
  index,
  startDate,
  endDate,
) => {
  try {
    const response = await api.post("schedules/confirm", {
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
