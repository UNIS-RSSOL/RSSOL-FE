import api from "../api";

//기간 지정 근무표 조회
export async function fetchSchedules(startDate, endDate) {
  try {
    const response = await api.get("/api/schedules/week", {
      params: {
        start: startDate,
        end: endDate,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
