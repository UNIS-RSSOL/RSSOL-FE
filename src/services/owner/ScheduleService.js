import api from "../api.js";

//근무블록 추가
export async function addWorkshift(userStoreId, start, end) {
  try {
    const response = await api.post("/api/schedules/workshifts", {
      userStoreId: userStoreId,
      startDatetime: start,
      endDatetime: end,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//근무블록삭제
export async function deleteWorkshift(workShiftId) {
  try {
    const response = await api.delete(
      `/api/schedules/workshifts/${workShiftId}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//대타요청하기
export async function requestSub(shiftId, reason = "") {
  try {
    console.log("📤 대타 요청 API 호출:", {
      endpoint: "/api/shift-swap/requests",
      shiftId,
      reason,
    });
    
    const response = await api.post("/api/shift-swap/requests", {
      shiftId: shiftId,
      reason: reason,
    });
    
    console.log("✅ 대타 요청 성공:", {
      status: response.status,
      data: response.data,
    });
    
    console.log("🔔 대타 요청 완료 - 백엔드에서 알림이 생성됩니다.");
    
    return response.data;
  } catch (error) {
    console.error("❌ 대타 요청 실패:", error);
    console.error("❌ 대타 요청 실패 상세:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

//추가인력요청
export async function requestWork(shiftId, headCount, note = "") {
  try {
    console.log("📤 인력 요청 API 호출:", {
      endpoint: "/api/extra-shift/requests",
      shiftId,
      headCount,
      note,
    });
    
    const response = await api.post("/api/extra-shift/requests", {
      shiftId: shiftId,
      headcount: headCount,
      note: note,
    });
    
    console.log("✅ 인력 요청 성공:", {
      status: response.status,
      data: response.data,
    });
    
    console.log("🔔 인력 요청 완료 - 백엔드에서 알림이 생성됩니다.");
    
    return response.data;
  } catch (error) {
    console.error("❌ 인력 요청 실패:", error);
    console.error("❌ 인력 요청 실패 상세:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

//모든 근무자 조회 (사장 포함)
export async function fetchAllWorkers() {
  try {
    const response = await api.get("/api/store/staff");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * 매장의 모든 직원 근무 가능 시간 조회 (사장용 API)
 * 제출안한 직원들은 빈배열 반환
 *
 * @param {number} storeId - 매장 ID
 * @returns {Promise<Array>} - 직원별 근무 가능 시간 배열 [ { username: string, availabilities: Array } ]
 *
 * API 엔드포인트: GET /api/{storeId}/availabilities
 *
 * 응답 형식:
 * [
 *   { "username": "사장B", "availabilities": [] },
 *   { "username": "알바4", "availabilities": [] },
 *   { "username": "알바5", "availabilities": [ { dayOfWeek: "MON", startTime: "09:00", endTime: "18:00" } ] }
 * ]
 *
 * 사장(Owner) 권한에서 사용하는 API입니다.
 * 직원 페이지에서는 /api/me/availabilities를 사용합니다.
 */
export async function fetchStoreAvailabilities(storeId) {
  if (!storeId) {
    const error = new Error("storeId가 없습니다.");
    console.error("❌ fetchStoreAvailabilities:", error.message, {
      storeId,
    });
    throw error;
  }

  try {
    // 토큰 확인
    const token = localStorage.getItem("accessToken");
    const endpoint = `/api/${storeId}/availabilities`;
    const fullURL = `${api.defaults.baseURL}${endpoint}`;

    console.log(`🔍 [조회 API] 매장 근무 가능 시간 조회 요청:`, {
      endpoint,
      fullURL,
      method: "GET",
      storeId,
      storeIdType: typeof storeId,
      tokenExists: !!token,
      tokenLength: token?.length || 0,
    });

    const response = await api.get(endpoint);

    // ✅ 정상 응답 처리 (200 OK)
    // 새로운 API 형식: GET /api/{storeId}/availabilities
    // 응답 형태: 배열 [ { username: string, availabilities: Array } ]
    // 예시:
    // [
    //   { "username": "사장B", "availabilities": [] },
    //   { "username": "알바4", "availabilities": [] },
    //   { "username": "알바5", "availabilities": [ { dayOfWeek: "MON", startTime: "09:00", endTime: "18:00" } ] }
    // ]

    // 응답 데이터 정규화
    let availabilitiesData = response.data;
    
    // 응답이 객체로 감싸져 있는 경우
    if (availabilitiesData && typeof availabilitiesData === 'object' && !Array.isArray(availabilitiesData)) {
      if (availabilitiesData.data && Array.isArray(availabilitiesData.data)) {
        availabilitiesData = availabilitiesData.data;
      } else if (availabilitiesData.availabilities && Array.isArray(availabilitiesData.availabilities)) {
        availabilitiesData = availabilitiesData.availabilities;
      }
    }

    // 응답이 배열 형태인 경우
    if (Array.isArray(availabilitiesData)) {
      // 각 항목에서 userStoreId 제거하고 username과 availabilities만 유지
      // API 스펙: username (소문자) 사용
      const normalizedData = availabilitiesData.map((item) => {
        // userStoreId가 있으면 제거
        const { userStoreId, ...rest } = item;
        return {
          username: item.username || item.userName, // API는 username, 하위 호환성을 위해 userName도 지원
          availabilities: Array.isArray(item.availabilities) ? item.availabilities : [],
        };
      });

      console.log(`✅ [조회 API] 매장 근무 가능 시간 조회 성공:`, {
        status: response.status,
        statusText: response.statusText,
        storeId,
        staffCount: normalizedData.length,
      });

      return normalizedData;
    }

    // 예상치 못한 응답 형태
    console.warn(`⚠️ [응답 형식 오류] 매장 ID:${storeId} - 응답 형식을 파싱할 수 없습니다:`, {
      originalData: response.data,
      normalizedData: availabilitiesData,
      dataType: typeof availabilitiesData,
    });
    return [];
  } catch (error) {
    const status = error.response?.status;
    const errorDetails = {
      storeId,
      storeIdType: typeof storeId,
      endpoint: `/api/${storeId}/availabilities`,
      status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
    };

    // 🔴 500 에러 (백엔드 내부 서버 오류) - 방어적 처리
    if (status === 500) {
      console.warn(
        `⚠️ [백엔드 500 에러 - 방어 처리] 매장 ID:${storeId} 근무 가능 시간 데이터 조회 실패 (서버 오류)`,
        {
          ...errorDetails,
          처리: "빈 배열 반환",
        },
      );
      return [];
    }

    // 🔴 404 에러 - 빈 배열 반환
    if (status === 404) {
      console.warn(
        `⚠️ 매장 ID:${storeId}를 찾을 수 없습니다 (404). 빈 배열 반환`,
        errorDetails,
      );
      return [];
    }

    // 🔴 기타 에러 (401, 403 등) - 에러 throw하여 상위에서 처리
    console.error(
      `🚨 [API 실패] 매장 ID:${storeId} 근무 가능시간 요청 실패:`,
      errorDetails,
    );

    throw error;
  }
}

/**
 * 특정 직원의 근무 가능 시간 조회 (사장용 API) - 레거시 함수
 * @deprecated 새로운 API 사용 권장: fetchStoreAvailabilities
 * @param {number} staffId - 조회할 직원의 staffId
 * @returns {Promise<Array>} - 근무 가능 시간 배열
 */
export async function fetchEmployeeAvailabilities(staffId) {
  console.warn("⚠️ fetchEmployeeAvailabilities는 deprecated입니다. fetchStoreAvailabilities를 사용하세요.");
  
  if (!staffId) {
    const error = new Error("staffId가 없습니다.");
    console.error("❌ fetchEmployeeAvailabilities:", error.message, {
      staffId,
    });
    throw error;
  }

  try {
    const endpoint = `/api/store/staff/${staffId}/availabilities`;
    const response = await api.get(endpoint);
    
    let availabilities = response.data;
    
    if (availabilities && typeof availabilities === 'object' && !Array.isArray(availabilities)) {
      if (availabilities.data && Array.isArray(availabilities.data)) {
        availabilities = availabilities.data;
      } else if (availabilities.availabilities && Array.isArray(availabilities.availabilities)) {
        availabilities = availabilities.availabilities;
      }
    }

    if (!Array.isArray(availabilities)) {
      return [];
    }

    return availabilities;
  } catch (error) {
    const status = error.response?.status;
    if (status === 500 || status === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * 내 근무 가능 시간 조회 (work availability) - 사장용
 * @returns {Promise<Array>} - 근무 가능 시간 배열
 */
export async function fetchMyAvailabilities() {
  try {
    const endpoint = "/api/me/availabilities";
    const fullURL = `${api.defaults.baseURL}${endpoint}`;
    
    console.log("🔍 [조회 API] 내 근무 가능 시간 조회 요청 (사장):", {
      endpoint,
      fullURL,
      method: "GET",
    });
    
    const response = await api.get(endpoint);
    
    console.log("✅ [조회 API] 내 근무 가능 시간 조회 성공 (사장):", {
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
    
    console.log("✅ [조회 API] 최종 반환 데이터 (사장):", {
      count: availabilities.length,
      data: availabilities,
    });
    
    return availabilities;
  } catch (error) {
    console.error("❌ [조회 API] 내 근무 가능 시간 조회 실패 (사장):", {
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

/**
 * 근무 가능 시간 전체 수정 (PUT - 전체 갱신 방식) - 사장용
 * @param {Object} payload - { userStoreId: number, userName: string, availabilities: [{ dayOfWeek: string, startTime: string, endTime: string }] }
 * @returns {Promise<Object>} - 응답 데이터
 */
export async function updateAvailability(payload) {
  try {
    const endpoint = "/api/me/availabilities";
    const fullURL = `${api.defaults.baseURL}${endpoint}`;
    
    console.log("📤 [수정 API] 근무 가능 시간 수정 요청 (사장):", {
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
    
    console.log("✅ [수정 API] 근무 가능 시간 수정 성공 (사장):", {
      status: response.status,
      statusText: response.statusText,
      responseData: response.data,
      savedUserStoreId: payload.userStoreId,
    });
    
    return response.data;
  } catch (error) {
    console.error("❌ [수정 API] 근무 가능 시간 수정 실패 (사장):", {
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