//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//본인 가능한 근무 시간 조회
export const getWorkAvailability = async () => {
  try {
    const response = await api.get("me/availabilities");
    return response.data;
  } catch (error) {
    console.error("가능한 근무 시간 조회 실패:", error);
    throw error;
  }
};

//본인 가능한 근무 시간 입력
export const setWorkAvailability = async (availabilities) => {
  try {
    const response = await api.post("me/availabilities", { availabilities });
    return response.data;
  } catch (error) {
    console.error("가능한 근무 시간 입력 실패:", error);
    throw error;
  }
};

//본인 가능한 근무 시간 수정
export const updateWorkAvailability = async (availabilities) => {
  try {
    const response = await api.put("me/availabilities", { availabilities });
    return response.data;
  } catch (error) {
    console.error("가능한 근무 시간 입력 실패:", error);
    throw error;
  }
};

//매장 근무자 가능한 근무 시간 조회
export const getStaffWorkAvailability = async (storeId) => {
  try {
    const response = await api.get(`${storeId}/availabilities`);
    return response.data;
  } catch (error) {
    console.error("매장 근무자들 가능한 근무 시간 조회 실패:", error);
    throw error;
  }
};
