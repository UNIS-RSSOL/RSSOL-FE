import api from "../api.js";

//급여계산
export const calculateWage = (
  storeId,
  month,
  userStoreId,
  totalHours,
  baseSalary,
  nightShiftPay,
  weeklyBonus,
  totalPay,
) => {
  try {
    const response = api.post("/api/payroll/calculate", {
      store_id: storeId,
      month: month,
      user_store_id: userStoreId,
      pay_details: {
        total_hour: totalHours,
        base_salary: baseSalary,
        night_shift_pay: nightShiftPay,
        weekly_bonus: weeklyBonus,
        total_pay: totalPay,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

//급여조회
export const fetchWage = (storeId, month, userStoreId) => {
  try {
    const response = api.get("/api/payrolls/preview/monthly", {
      params: {
        store_id: storeId,
        month: month,
        user_store_id: userStoreId,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
