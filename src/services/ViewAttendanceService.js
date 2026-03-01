import api from "./Api.js";

export const getEmployeeAttendance = async (
  userStoreId,
  startDate,
  endDate,
) => {
  try {
    const response = await api.get(
      `administration-staff/employees/${userStoreId}/attendance`,
      {
        params: {
          startDate,
          endDate,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("출석 조회 실패:", error);
    throw error;
  }
};
