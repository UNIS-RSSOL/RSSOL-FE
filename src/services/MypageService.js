//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//알바생
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//알바생 마이페이지 내 정보 조회
export const getStaffProfile = async () => {
  try {
    const response = await api.get("mypage/staff/profile");
    return response.data;
  } catch (error) {
    console.error("알바생 마이페이지 내 정보 조회 실패:", error);
    throw error;
  }
};

//알바생 마이페이지 내 정보 수정
export const updateStaffProfile = async (
  username,
  email,
  bankId,
  accountNumber,
) => {
  try {
    const response = await api.put("mypage/staff/profile", {
      username,
      email,
      bankId,
      accountNumber,
    });
    return response.data;
  } catch (error) {
    console.error("알바생 마이페이지 내 정보 수정 실패:", error);
    throw error;
  }
};

//알바생 전체 가게 조회
export const getStaffStoreList = async () => {
  try {
    const response = await api.get("mypage/staff/stores");
    return response.data;
  } catch (error) {
    console.error("알바생 전체 가게 조회 실패:", error);
    throw error;
  }
};

//알바생 가게 추가
export const addStaffStore = async (storeCode, hireDate) => {
  try {
    const response = await api.post("mypage/staff/stores", {
      storeCode,
      hireDate,
    });
    return response.data;
  } catch (error) {
    console.error("알바생 가게 추가 실패:", error);
    throw error;
  }
};

//알바생 가게 삭제
export const deleteStaffStore = async (storeId) => {
  try {
    const response = await api.delete(`mypage/staff/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("알바생 가게 삭제 실패:", error);
    throw error;
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//사장님
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//사장님 마이페이지 내 정보 조회
export const getOwnerProfile = async () => {
  try {
    const response = await api.get("mypage/owner/profile");
    return response.data;
  } catch (error) {
    console.error("사장님 마이페이지 내 정보 조회 실패:", error);
    throw error;
  }
};

//사장님 마이페이지 내 정보 수정
export const updateOwnerProfile = async (
  username,
  email,
  businessRegistrationNumber,
) => {
  try {
    const response = await api.put("mypage/owner/profile", {
      username,
      email,
      businessRegistrationNumber,
    });
    return response.data;
  } catch (error) {
    console.error("사장님 마이페이지 내 정보 수정 실패:", error);
    throw error;
  }
};

//사장님 마이페이지 내 가게 조회
export const getOwnerStore = async () => {
  try {
    const response = await api.get("mypage/owner/store");
    return response.data;
  } catch (error) {
    console.error("사장님 마이페이지 내 가게 조회 실패:", error);
    throw error;
  }
};

//사장님 마이페이지 내 가게 수정
export const updateOwnerStore = async (name, address, phoneNumber) => {
  try {
    const response = await api.put("mypage/owner/store", {
      name,
      address,
      phoneNumber,
    });
    return response.data;
  } catch (error) {
    console.error("사장님 마이페이지 내 가게 수정 실패:", error);
    throw error;
  }
};

//사장님 전체 가게 조회
export const getOwnerStoreList = async () => {
  try {
    const response = await api.get("mypage/owner/stores");
    return response.data;
  } catch (error) {
    console.error("사장님 전체 가게 조회 실패:", error);
    throw error;
  }
};

//사장님 가게 추가
export const addOwnerStore = async (
  name,
  address,
  phoneNumber,
  businessRegistrationNumber,
  hireDate,
) => {
  try {
    const response = await api.post("mypage/owner/stores", {
      name,
      address,
      phoneNumber,
      businessRegistrationNumber,
      hireDate,
    });
    return response.data;
  } catch (error) {
    console.error("사장님 가게 추가 실패:", error);
    throw error;
  }
};

//사장님 가게 삭제
export const deleteOwnerStore = async (storeId) => {
  try {
    const response = await api.delete(`mypage/owner/stores/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("사장님 가게 삭제 실패:", error);
    throw error;
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//공통
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//활성 매장 조회
export const getActiveStore = async () => {
  try {
    const response = await api.get("mypage/active-store");
    return response.data;
  } catch (error) {
    console.error("활성 매장 조회 실패:", error);
    throw error;
  }
};

//활성 매장 변경
export const changeActiveStore = async (storeId) => {
  try {
    const response = await api.patch(`mypage/active-store/${storeId}`);
    return response.data;
  } catch (error) {
    console.error("활성 매장 변경 실패:", error);
    throw error;
  }
};
