import api from "../api.js";

// 근무표 작성 요청 알림 전송
export async function sendScheduleRequestNotification(storeId, month) {
  try {
    const response = await api.post("/api/notifications/schedule-request", {
      storeId: storeId,
      month: month,
    });
    return response.data;
  } catch (error) {
    console.error("알림 전송 실패:", error);
    throw error;
  }
}

