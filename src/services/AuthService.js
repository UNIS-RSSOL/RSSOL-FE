//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";
import axios from "axios";

//토큰갱신
export const refreshToken = async () => {
  try {
    const refreshTokenValue = localStorage.getItem("refreshToken");
    if (!refreshTokenValue) {
      throw new Error("Refresh token이 없습니다.");
    }

    // refresh-token API는 특별히 Authorization 헤더를 직접 설정해야 함
    const response = await axios.post(
      "https://api.rssolplan.com/api/auth/refresh-token",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshTokenValue}`,
        },
      }
    );

    if (response.data?.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      return response.data.accessToken;
    } else {
      throw new Error("토큰 응답에 accessToken이 없습니다.");
    }
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
