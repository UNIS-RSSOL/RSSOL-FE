//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//토큰갱신
export const refreshToken = async () => {
  try {
    const response = await api.post("auth/refresh-token", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
    });
    localStorage.setItem("accessToken", response.data.accessToken);
  } catch (error) {
    console.error("토큰갱신 실패:", error);
    throw error;
  }
};

//로그아웃
export const logout = async () => {
  try {
    await api.post("auth/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    throw error;
  }
};
