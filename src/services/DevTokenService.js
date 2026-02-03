//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//개발 토큰
export const getDevToken = async (email) => {
  try {
    const response = await api.post("auth/dev-token", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("개발 토큰 실패:", error);
    throw error;
  }
};
