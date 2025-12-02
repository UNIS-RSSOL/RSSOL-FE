import api from "../api.js";

//급여조회
export async function fetchWage(storeId, userStoreId, month) {
  try {
    const response = await api.get("/api/payrolls/preview/monthly", {
      params: {
        store_id: storeId,
        user_store_id: userStoreId,
        month: month,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
