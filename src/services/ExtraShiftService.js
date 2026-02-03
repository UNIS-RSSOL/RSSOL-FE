//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//추가 인력 요청 생성
export const createExtraShiftRequest = async (
  shiftId,
  headCount,
  note = "",
) => {
  try {
    const response = await api.post("extra-shift/requests", {
      shiftId,
      headCount,
      note,
    });
    return response.data;
  } catch (error) {
    console.error("추가 인력 요청 생성 실패:", error);
    throw error;
  }
};

//추가 인력 1차 수락/거절
export const respondExtraShiftRequest = async (requestId, action) => {
  try {
    const response = await api.patch(
      `extra-shift/requests/${requestId}/respond`,
      {
        action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("추가 인력 1차 수락/거절 실패:", error);
    throw error;
  }
};

//추가 인력 사장님 승인/미승인
export const approveExtraShiftRequest = async (
  requestId,
  responseId,
  action,
) => {
  try {
    const response = await api.patch(
      `extra-shift/requests/${requestId}/manager-approval`,
      {
        responseId,
        action,
      },
    );
    return response.data;
  } catch (error) {
    console.error("추가 인력 사장님 승인/미승인 실패:", error);
    throw error;
  }
};
