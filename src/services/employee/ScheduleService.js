import api from "../api";

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
