//https://connecti.store/swagger-ui/index.html#/
import axios from "axios";

//개발 토큰 - 별도 인스턴스 사용 (인터셉터 우회)
const devApi = axios.create({
  baseURL: "https://api.rssolplan.com/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

//개발 토큰
export const getDevToken = async (email) => {
  try {
    const response = await devApi.post("auth/dev-token", {
      email,
    });
    return response.data;
  } catch (error) {
    console.error("개발 토큰 실패:", error);
    throw error;
  }
};
