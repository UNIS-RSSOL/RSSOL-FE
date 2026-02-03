//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//대타 요청 생성
export const createShiftSwapRequest = async (shiftId, reason = "대타 요청") => {
  try {
    const response = await api.post("shift-swap/requests", {
      shiftId,
      reason,
    });
    return response.data;
  } catch (error) {
    console.error("대타 요청 생성 실패:", error);
    throw error;
  }
};

//대타 요청 1차 수락/거절
export const respondShiftSwapRequest = async (requestId, action) => {
  try {
    const response = await api.patch(
      `shift-swap/requests/${requestId}/respond`,
      {
        action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("대타 요청 1차 수락/거절 실패:", error);
    throw error;
  }
};

//대타 요청 사장님 승인/미승인
export const approveShiftSwapRequest = async (requestId, action) => {
  try {
    const response = await api.patch(
      `shift-swap/requests/${requestId}/manager-approval`,
      {
        action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("대타 요청 사장님 승인/미승인 실패:", error);
    throw error;
  }
};
