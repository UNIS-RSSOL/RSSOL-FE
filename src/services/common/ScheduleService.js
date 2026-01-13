import api from "../api.js";

//기간 지정 근무표 조회
export async function fetchSchedules(startDate, endDate, storeId = null) {
  try {
    const params = {
      start: startDate,
      end: endDate,
    };

    // storeId가 제공되면 파라미터에 추가
    if (storeId) {
      params.storeId = storeId;
    }

    console.log("📅 스케줄 조회 API 호출:", {
      endpoint: "/api/schedules/store/week",
      params: params,
      storeId: storeId,
    });

    const response = await api.get("/api/schedules/store/week", {
      params: params,
    });

    console.log("✅ 스케줄 조회 응답:", {
      status: response.status,
      dataCount: Array.isArray(response.data) ? response.data.length : 0,
      uniqueUsers: Array.isArray(response.data)
        ? [
            ...new Set(
              response.data.map((s) => s.username || s.userName || "unknown"),
            ),
          ]
        : [],
      data: response.data,
    });

    return response.data;
  } catch (error) {
    console.error("❌ 스케줄 조회 실패:", error);
    console.error("❌ 에러 상세:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}
