import api from "../api";

export async function fetchWage(storeId, month, userStoreId) {
  try {
    const response = api.get("/api/payrolls/preview/monthly", {
      params: {
        store_id: storeId,
        user_store_id: userStoreId,
        month: month,
      },
    });
    return response.return;
  } catch (error) {
    console.error(error);
  }
}
