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
    const response = await api.post("/api/shift-swap/requests", {
      shiftId: shiftId,
      reason: reason,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

// 내 근무 가능 시간 조회 (work availability)
export async function fetchMyAvailabilities() {
  try {
    console.log("🔍 fetchMyAvailabilities: API 요청 시작");
    const response = await api.get("/api/me/availabilities");
    console.log("🔍 fetchMyAvailabilities: API 응답:", response.data);
    console.log("🔍 fetchMyAvailabilities: 응답 타입:", typeof response.data);
    console.log("🔍 fetchMyAvailabilities: 배열 여부:", Array.isArray(response.data));
    
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
    
    console.log("🔍 fetchMyAvailabilities: 최종 반환 데이터:", availabilities);
    console.log("🔍 fetchMyAvailabilities: 최종 반환 데이터 개수:", availabilities.length);
    
    return availabilities;
  } catch (error) {
    console.error("❌ fetchMyAvailabilities: 근무 가능 시간 조회 실패:", error);
    console.error("❌ fetchMyAvailabilities: 에러 응답:", error.response?.data);
    throw error;
  }
}

// 근무 가능 시간 추가
// payload: { userStoreId: number, userName: string, availabilities: [{ dayOfWeek: string, startTime: string, endTime: string }] }
export async function addAvailability(payload) {
  try {
    console.log("API 요청 payload:", JSON.stringify(payload, null, 2));
    const response = await api.post("/api/me/availabilities", payload);
    return response.data;
  } catch (error) {
    console.error("근무 가능 시간 추가 실패:", error);
    console.error("에러 응답:", error.response?.data);
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