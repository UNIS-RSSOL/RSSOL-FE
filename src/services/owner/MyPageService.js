import api from "../api.js";

export async function fetchMydata() {
  try {
    const response = api.get("/api/mypage/owner/profile");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function fetchStoredata() {
  try {
    const response = api.get("/api/mypage/owner/store");
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export async function changeMydata(
  username,
  email,
  businessRegistrationNumber,
) {
  try {
    const response = api.put("/api/mypage/owner/profile", {
      username,
      email,
      businessRegistrationNumber,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
