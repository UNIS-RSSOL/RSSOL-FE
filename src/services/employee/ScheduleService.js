import api from "../api.js";

//기간지정 스케쥴 불러오기
export async function fetchSchedules(start, end) {
  try {
    const response = await api.get("/api/schedules/me/week", {
      params: {
        start: start,
        end: end,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//대타 요청 생성
export async function requestSub(shiftId, reason = "") {
  try {
    const response = await api.post("/api/shift-swap/requests", {
      shiftId: shiftId,
      reason: reason,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// 내 근무 가능 시간 조회 (work availability)
export async function fetchMyAvailabilities() {
  try {
    const response = await api.get("/api/me/availabilities");
    return response.data;
  } catch (error) {
    console.error("근무 가능 시간 조회 실패:", error);
    throw error;
  }
}

// 근무 가능 시간 추가
export async function addAvailability(startDatetime, endDatetime) {
  try {
    const response = await api.post("/api/me/availabilities", {
      startDatetime: startDatetime,
      endDatetime: endDatetime,
    });
    return response.data;
  } catch (error) {
    console.error("근무 가능 시간 추가 실패:", error);
    throw error;
  }
}

// 근무 가능 시간 삭제
export async function deleteAvailability(availabilityId) {
  try {
    const response = await api.delete(`/api/me/availabilities/${availabilityId}`);
    return response.data;
  } catch (error) {
    console.error("근무 가능 시간 삭제 실패:", error);
    throw error;
  }
}