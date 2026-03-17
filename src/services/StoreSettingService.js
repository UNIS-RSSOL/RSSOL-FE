import api from "./Api.js";

// 매장 설정 조회 (파트타임 구간 포함)
export const getStoreSettings = async (storeId) => {
  try {
    const response = await api.get(`store-settings/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("매장 설정 조회 실패:", error);
    throw error;
  }
};

// 매장 설정 조회 (활성 매장 기준)
export const getActiveStoreSettings = async () => {
  try {
    const response = await api.get("store-settings");
    return response.data;
  } catch (error) {
    console.error("매장 설정 조회 실패:", error);
    throw error;
  }
};
