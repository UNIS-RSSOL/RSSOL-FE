//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//알림 조회
export const getNotification = async () => {
  try {
    const response = await api.get("notifications");
    return response.data;
  } catch (error) {
    console.error("알림 조회 실패:", error);
    throw error;
  }
};
