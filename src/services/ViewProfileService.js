import api from "./Api.js";

//직원 프로필 조회
export const getEmployeeProfile = async (userStoreId) => {
  try {
    const response = await api.get(
      `administration-staff/employees/${userStoreId}/profile`,
    );
    return response.data;
  } catch (error) {
    console.error("직원 프로필 조회 실패:", error);
    throw error;
  }
};

/*
{
  "username": "string",
  "status": "string",
  "position": "string",
  "storeName": "string",
  "bankName": "string",
  "accountNumber": "string",
  "email": "string",
  "hireDate": "2026-02-26",
  "daysWorked": 0
}
*/
