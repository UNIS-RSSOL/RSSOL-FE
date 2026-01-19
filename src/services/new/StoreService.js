//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//매장 전체 근무자 목록 조회
export const getAllWorker = async () => {
  try {
    const response = await api.get("store/staff");
    return response.data;
  } catch (error) {
    console.error("매장 전체 근무자 목록 조회 실패:", error);
    throw error;
  }
};
