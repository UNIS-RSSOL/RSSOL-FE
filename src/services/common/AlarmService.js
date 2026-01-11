import api from "../api.js";

export async function fetchAlarm() {
  try {
    const response = await api.get("/api/notifications");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
