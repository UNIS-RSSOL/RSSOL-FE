import api from "../api.js";

//내정보 조회
export async function fetchMydata() {
  try {
    const response = await api.get("/api/mypage/staff/profile");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//내정보 수정
export async function updateMydata(username, email, bankId, accountNumber) {
  try {
    const response = await api.put("/api/mypage/staff/profile", {
      username: username,
      email: email,
      bankId: bankId,
      accountNumber: accountNumber,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//알바생 매장 목록 전체 조회
export async function fetchStoreList() {
  try {
    const response = await api.get("/api/mypage/staff/stores");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//매장 추가 등록
export async function addStore(storeCode, hireDate) {
  try {
    const response = await api.post("/api/mypage/staff/stores", {
      storeCode: storeCode,
      hireDate: hireDate,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//매장 삭제
export async function deleteStore(storeId) {
  try {
    const response = await api.delete(`/api/mypage/staff/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//활성 매장 조회
export async function fetchActiveStore() {
  try {
    const response = await api.get("/api/mypage/active-store");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//활성 매장 변경
export async function changeActiveStore(storeId) {
  try {
    const response = await api.patch(`/api/mypage/active-store/${storeId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
