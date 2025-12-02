import api from "../api.js";

//근무블록 추가
export async function addWorkshift(userId, storeId, start, end) {
  try {
    const response = await api.post("/api/schedules/workshifts", {
      userId: userId,
      storeId: storeId,
      startDatetime: start,
      endDatetime: end,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//근무블록삭제
export async function deleteWorkshift(workShiftId) {
  try {
    const response = await api.delete(
      `/api/schedules/workshifts/${workShiftId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//대타요청하기
export async function requestSub(shiftId, reason = "") {
  try {
    const response = await api.post("/api/shift-swap/requests", {
      shiftId: shiftId,
      reason: reason,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//추가인력요청
export async function requestWork(shiftId, headCount, note = "") {
  try {
    const response = await api.post("/api/staffing/requests", {
      shiftId: shiftId,
      headcount: headCount,
      note: note,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

//모든 근무자 조회 (사장 포함)
export async function fetchAllWorkers() {
  try {
    const response = await api.get("/api/store/staff");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 특정 직원의 work availability 조회 (사장용)
// API 엔드포인트가 정확하지 않을 수 있으므로, Swagger 문서 확인 필요
// 대안: /api/store/availabilities 또는 /api/store/staff/availabilities
export async function fetchEmployeeAvailabilities(userId) {
  try {
    // 먼저 /api/store/staff/{userId}/availabilities 시도
    const response = await api.get(`/api/store/staff/${userId}/availabilities`);
    return response.data;
  } catch (error) {
    // 다른 엔드포인트 시도
    try {
      const response = await api.get(`/api/store/availabilities`, {
        params: { userId }
      });
      return response.data;
    } catch (error2) {
      console.error("직원 근무 가능 시간 조회 실패:", error2);
      return [];
    }
  }
}