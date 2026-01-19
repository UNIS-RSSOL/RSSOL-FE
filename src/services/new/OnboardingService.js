//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//온보딩 알바생
export const onboardingStaff = async (
  storeCode,
  bankId,
  accountNumber,
  hireDate,
) => {
  try {
    const response = await api.post("auth/onboarding", {
      role: "STAFF",
      storeCode,
      bankId,
      accountNumber,
      hireDate,
    });
    return response.data;
  } catch (error) {
    console.error("온보딩 알바생 실패:", error);
    throw error;
  }
};

//온보딩 사장님
export const onboardingBoss = async (
  name,
  address,
  phoneNumber,
  businessRegistrationNumber,
  hireDate,
) => {
  try {
    const response = await api.post("auth/onboarding", {
      role: "OWNER",
      name,
      address,
      phoneNumber,
      businessRegistrationNumber,
      hireDate,
    });
    return response.data;
  } catch (error) {
    console.error("온보딩 사장님 실패:", error);
    throw error;
  }
};
