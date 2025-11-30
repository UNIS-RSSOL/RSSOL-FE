import api from "../api";

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
