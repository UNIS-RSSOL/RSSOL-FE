import api from "../api.js";

//내정보 조회
export async function fetchMydata() {
  try {
    const response = await api.get("/api/mypage/owner/profile");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//가게정보 조회
export async function fetchStoredata() {
  try {
    const response = await api.get("/api/mypage/owner/store");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//내정보 수정
export async function updateMydata(
  username,
  email,
  businessRegistrationNumber,
) {
  try {
    const response = await api.put("/api/mypage/owner/profile", {
      username: username,
      email: email,
      businessRegistrationNumber: businessRegistrationNumber,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//가게정보 수정
export async function updateStoredata(
  name,
  address,
  phoneNumber,
  businessRegistrationNumber,
) {
  try {
    const response = await api.put("/api/mypage/owner/store", {
      name: name,
      address: address,
      phoneNumber: phoneNumber,
      businessRegistrationNumber: businessRegistrationNumber,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//사장님 매장 목록 전체 조회
export async function fetchStoreList() {
  try {
    const response = await api.get("/api/mypage/owner/stores");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//매장 추가 등록
export async function addStore(
  businessRegistrationNumber,
  name,
  address,
  phoneNumber,
) {
  try {
    const response = await api.post("/api/mypage/owner/stores", {
      businessRegistrationNumber: businessRegistrationNumber,
      name: name,
      address: address,
      phoneNumber: phoneNumber,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//매장 삭제
export async function deleteStore(storeId) {
  try {
    const response = await api.delete(`/api/mypage/owner/stores/${storeId}`);
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
