import api from "./Api.js";

/** 오늘 출퇴근 상태 조회 */
export const getTodayAttendance = async () => {
  const response = await api.get("attendance/today");
  return response.data;
};

/** 출근 */
export const checkIn = async () => {
  const response = await api.post("attendance/check-in");
  return response.data;
};

/** 퇴근 */
export const checkOut = async () => {
  const response = await api.post("attendance/check-out");
  return response.data;
};
