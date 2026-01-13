import api from "../api.js";

export async function fetchAlarm() {
  try {
    const response = await api.get("/api/notifications");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//대타 요청 1차 수락/거절
export async function acceptShiftSwap(requestId, action) {
  try {
    const response = await api.patch(
      `/api/shift-swap/requests/${requestId}/respond`,
      {
        action: action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ 대타 요청 1차 수락/거절 실패:", error);
    throw error;
  }
}

//대타 요청 최종 승인.미승인(사장님)
export async function approveShiftSwap(requestId, action) {
  try {
    const response = await api.patch(
      `/api/shift-swap/requests/${requestId}/manager-approval`,
      {
        action: action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ 대타 요청 최종 승인/미승인 실패:", error);
    throw error;
  }
}

//알바생 인력 요청에 대한 수락/거절 응답
export async function respondStaffRequest(requestId, action) {
  try {
    const response = await api.patch(
      `/api/extra-shift/requests/${requestId}/respond`,
      {
        action: action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ 알바생 인력 요청 수락/거절 실패:", error);
    throw error;
  }
}

//알바생 인력 요청 최종 승인/미승인
export async function approveStaffRequest(requestId, action) {
  try {
    const response = await api.patch(
      `/api/extra-shift/requests/${requestId}/manager-approval`,
      {
        action: action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ 알바생 인력 요청 최종 승인/미승인 실패:", error);
    throw error;
  }
}
