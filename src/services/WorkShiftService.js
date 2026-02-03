//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//최종 근무표 조회
export const getSchedule = async () => {
  try {
    const response = await api.get("schedules");
    return response.data;
  } catch (error) {
    console.error("스케쥴 조회 실패:", error);
    throw error;
  }
};

//기간 지정 근무표 조회
export const getScheduleByPeriod = async (start, end) => {
  try {
    const response = await api.get("schedules/store/week", {
      params: {
        start,
        end,
      },
    });
    return response.data;
  } catch (error) {
    console.error("기간 지정 근무표 조회 실패:", error);
    throw error;
  }
};

//기간 지정 내 근무표 조회
export const getMyScheduleByPeriod = async (start, end) => {
  try {
    const response = await api.get("schedules/me/week", {
      params: {
        start,
        end,
      },
    });
    return response.data;
  } catch (error) {
    console.error("기간 지정 내 근무표 조회 실패:", error);
    throw error;
  }
};

//근무 블록 추가
export const addWorkShift = async (userStoreId, startDatetime, endDatetime) => {
  try {
    const response = await api.post("schedules/workshifts", {
      userStoreId,
      startDatetime,
      endDatetime,
    });
    return response.data;
  } catch (error) {
    console.error("근무 블록 추가 실패:", error);
    throw error;
  }
};

//근무 블록 수정
export const updateWorkShift = async (shiftId, startDatetime, endDatetime) => {
  try {
    const response = await api.patch(`schedules/workshifts/${shiftId}`, {
      startDatetime,
      endDatetime,
    });
    return response.data;
  } catch (error) {
    console.error("근무 블록 수정 실패:", error);
    throw error;
  }
};

//근무 블록 삭제
export const deleteWorkShift = async (shiftId) => {
  try {
    const response = await api.delete(`schedules/workshifts/${shiftId}`);
    return response.data;
  } catch (error) {
    console.error("근무 블록 삭제 실패:", error);
    throw error;
  }
};
