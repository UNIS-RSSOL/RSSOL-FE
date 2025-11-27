import api from "./api";

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
