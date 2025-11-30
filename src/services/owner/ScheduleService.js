import api from "../api";

//현재매장 모든 근무자들 이름 조회하기
export async function fetchAllWorkers() {
  try {
    const response = api.get("/api/store/staff");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

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

//대타요청하기
// export async function requestSub(shiftId, ) {
//   try {
//     const response = api.post("/api/shift-swap/requests");
//     return (await response).data;
//   } catch (error) {
//     console.error(error);
//   }
// }

//추가인력요청
export async function requestWork(shiftId, headCount, note = "") {
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
