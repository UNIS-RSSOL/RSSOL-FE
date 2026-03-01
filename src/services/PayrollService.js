import api from "./Api.js";

//직원별 시급 입력
export const putStaffHourlyWage = async (userStoreId, hourlyWage) => {
  try {
    const response = await api.put(`payroll/store/staff/${userStoreId}/wage`, {
      hourlyWage,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//기간별최저시급설정
export const setMinimumWageByPeriod = async (
  hourlyWage,
  effectiveFrom,
  effectiveTo,
  description = "",
) => {
  try {
    const response = await api.post("payroll/admin/minimum-wage", {
      hourlyWage,
      effectiveFrom,
      effectiveTo,
      description,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//가게임금정보 불러오기
export const getStoreWage = async () => {
  try {
    const response = await api.get("payroll/store/wages");
    return response.data;
  } catch (error) {
    throw error;
  }
};

//달별 가게 임금지출 가져오기
export const getTotalWage = async (year, month) => {
  try {
    const response = await api.get("payroll/store/total", {
      params: {
        year,
        month,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//달별 가게 임금 summary 가져오기
export const getSummaryWage = async (year, month) => {
  try {
    const response = await api.get("payroll/store/summary", {
      params: {
        year,
        month,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//스태프별 한달 임금 가져오기
export const getStaffWage = async (userStoreId, year, month) => {
  try {
    const response = await api.get(`payroll/store/staff/${userStoreId}`, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//직원별 한달 임금 가져오기
export const getEmployeeWage = async (userStoreId, year, month) => {
  try {
    const response = await api.get(`payroll/store/employee/${userStoreId}`, {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//연도별 최저임금 가져오기
export const getMinimumWageByYear = async (year) => {
  try {
    const response = await api.get("payroll/minimum-wage", {
      params: { year },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//최저임금 가져오기
export const getMinimumWage = async () => {
  try {
    const response = await api.get("payroll/minimum-wage/current");
    return response.data;
  } catch (error) {
    throw error;
  }
};

//내 임금 가져오기
export const getMyWage = async (year, month) => {
  try {
    const response = await api.get("payroll/me", {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//내 임금 가져오기 (모든 가게)
export const getMyTotalWage = async (year, month) => {
  try {
    const response = await api.get("payroll/me/total", {
      params: { year, month },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
