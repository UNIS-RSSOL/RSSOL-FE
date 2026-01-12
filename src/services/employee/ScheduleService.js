import api from "../api.js";

//기간지정 스케쥴 불러오기
export async function fetchSchedules(start, end) {
  try {
    const response = await api.get("/api/schedules/me/week", {
      params: {
        start: start,
        end: end,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//대타 요청 생성
export async function requestSub(shiftId, reason = "") {
  try {
    console.log("📤 대타 요청 API 호출 (직원):", {
      endpoint: "/api/shift-swap/requests",
      shiftId,
      reason,
    });
    
    const response = await api.post("/api/shift-swap/requests", {
      shiftId: shiftId,
      reason: reason,
    });
    
    console.log("✅ 대타 요청 성공 (직원):", {
      status: response.status,
      data: response.data,
    });
    
    console.log("🔔 대타 요청 완료 - 백엔드에서 알림이 생성됩니다.");
    
    return response.data;
  } catch (error) {
    console.error("❌ 대타 요청 실패 (직원):", error);
    console.error("❌ 대타 요청 실패 상세:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

// 내 근무 가능 시간 조회 (work availability)
export async function fetchMyAvailabilities() {
  try {
    const endpoint = "/api/me/availabilities";
    const fullURL = `${api.defaults.baseURL}${endpoint}`;
    
    console.log("🔍 [조회 API] 내 근무 가능 시간 조회 요청:", {
      endpoint,
      fullURL,
      method: "GET",
    });
    
    const response = await api.get(endpoint);
    
    console.log("✅ [조회 API] 내 근무 가능 시간 조회 성공:", {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data,
      responseType: typeof response.data,
      isArray: Array.isArray(response.data),
    });
    
    // 응답이 배열이 아닌 경우 처리
    let availabilities = response.data;
    if (!Array.isArray(availabilities)) {
      // 만약 응답이 객체이고 내부에 배열이 있다면
      if (availabilities && availabilities.availabilities && Array.isArray(availabilities.availabilities)) {
        availabilities = availabilities.availabilities;
      } else if (availabilities && availabilities.data && Array.isArray(availabilities.data)) {
        availabilities = availabilities.data;
      } else {
        // 배열이 아니면 빈 배열로 처리
        console.warn("⚠️ fetchMyAvailabilities: 응답이 배열이 아님, 빈 배열 반환");
        availabilities = [];
      }
    }
    
    console.log("✅ [조회 API] 최종 반환 데이터:", {
      count: availabilities.length,
      data: availabilities,
    });
    
    return availabilities;
  } catch (error) {
    console.error("❌ [조회 API] 내 근무 가능 시간 조회 실패:", {
      endpoint: "/api/me/availabilities",
      method: "GET",
      errorStatus: error.response?.status,
      errorStatusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
      requestHeaders: error.config?.headers,
    });
    throw error;
  }
}

// 근무 가능 시간 추가
// payload: { userStoreId: number, userName: string, availabilities: [{ dayOfWeek: string, startTime: string, endTime: string }] }
export async function addAvailability(payload) {
  try {
    const endpoint = "/api/me/availabilities";
    const fullURL = `${api.defaults.baseURL}${endpoint}`;
    
    console.log("📤 [저장 API] 근무 가능 시간 추가 요청:", {
      endpoint,
      fullURL,
      method: "POST",
      payload: {
        ...payload,
        availabilitiesCount: payload.availabilities?.length || 0,
        availabilities: payload.availabilities?.map(av => ({
          dayOfWeek: av.dayOfWeek,
          startTime: av.startTime,
          endTime: av.endTime,
        })),
      },
      userStoreId: payload.userStoreId,
      userStoreIdType: typeof payload.userStoreId,
      userName: payload.userName,
    });
    
    const response = await api.post(endpoint, payload);
    
    console.log("✅ [저장 API] 근무 가능 시간 추가 성공:", {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data,
      savedUserStoreId: payload.userStoreId,
    });
    
    return response.data;
  } catch (error) {
    console.error("❌ [저장 API] 근무 가능 시간 추가 실패:", {
      endpoint: "/api/me/availabilities",
      method: "POST",
      payload: {
        userStoreId: payload.userStoreId,
        userName: payload.userName,
        availabilitiesCount: payload.availabilities?.length || 0,
      },
      errorStatus: error.response?.status,
      errorStatusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
      requestHeaders: error.config?.headers,
    });
    throw error;
  }
}

// 근무 가능 시간 전체 수정 (PUT - 전체 갱신 방식)
// payload: { userStoreId: number, userName: string, availabilities: [{ dayOfWeek: string, startTime: string, endTime: string }] }
// PUT은 전체 리스트를 갱신하므로, 삭제하려는 항목을 제외하고 보내면 자동으로 삭제됨
export async function updateAvailability(payload) {
  try {
    const endpoint = "/api/me/availabilities";
    const fullURL = `${api.defaults.baseURL}${endpoint}`;
    
    console.log("📤 [수정 API] 근무 가능 시간 수정 요청:", {
      endpoint,
      fullURL,
      method: "PUT",
      payload: {
        ...payload,
        availabilitiesCount: payload.availabilities?.length || 0,
        availabilities: payload.availabilities?.map(av => ({
          dayOfWeek: av.dayOfWeek,
          startTime: av.startTime,
          endTime: av.endTime,
        })),
      },
      userStoreId: payload.userStoreId,
      userStoreIdType: typeof payload.userStoreId,
      userName: payload.userName,
    });
    
    const response = await api.put(endpoint, payload);
    
    console.log("✅ [수정 API] 근무 가능 시간 수정 성공:", {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data,
      savedUserStoreId: payload.userStoreId,
    });
    
    return response.data;
  } catch (error) {
    console.error("❌ [수정 API] 근무 가능 시간 수정 실패:", {
      endpoint: "/api/me/availabilities",
      method: "PUT",
      payload: {
        userStoreId: payload.userStoreId,
        userName: payload.userName,
        availabilitiesCount: payload.availabilities?.length || 0,
      },
      errorStatus: error.response?.status,
      errorStatusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
      requestHeaders: error.config?.headers,
    });
    throw error;
  }
}

// 근무 가능 시간 삭제
export async function deleteAvailability(availabilityId) {
  try {
    if (!availabilityId) {
      throw new Error("availabilityId가 필요합니다.");
    }
    
    // ID 타입 확인 및 정규화 (숫자로 변환 시도)
    const normalizedId = typeof availabilityId === 'string' 
      ? parseInt(availabilityId, 10) 
      : availabilityId;
    
    if (isNaN(normalizedId)) {
      throw new Error(`유효하지 않은 availabilityId: ${availabilityId}`);
    }
    
    // DELETE 요청 (body 없이 URL param만 사용)
    const url = `/api/me/availabilities/${normalizedId}`;
    
    if (import.meta.env.DEV) {
      console.log(`🔍 DELETE 요청: ${url}`, { id: normalizedId, idType: typeof normalizedId });
    }
    
    const response = await api.delete(url);
    return response.data;
  } catch (error) {
    // 상세 에러 정보 로깅
    if (error.response) {
      console.error(`❌ DELETE 실패 상세:`, {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.config?.headers,
      });
    } else if (error.request) {
      console.error(`❌ DELETE 요청 실패 (응답 없음):`, {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error(`❌ DELETE 요청 설정 실패:`, error.message);
    }
    throw error;
  }
}