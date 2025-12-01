import api from "../api";

//근무블록 추가
export async function addWorkshift(userStoreId, start, end) {
  try {
    const response = api.post("/api/schedules/workshifts", {
      userStoreId: userStoreId,
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
    const response = api.delete(`/api/schedules/workshifts/${workShiftId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//추가인력요청
export async function requestWork(shiftId, headCount, note) {
  try {
    const response = api.post("/api/staffing/requests", {
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
    const response = await api.get("/api/mypage/owner/workers");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}