import api from "../api";

export async function addWorkshift(userStoreId, start, end) {
  try {
    const response = api.post("/api/schedules/workshifts", {
      userStoreId: userStoreId,
      startDatetime: start,
      endDatetime: end,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
