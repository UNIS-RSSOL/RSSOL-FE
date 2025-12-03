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
    const response = await api.post("/api/shift-swap/requests", {
      shiftId: shiftId,
      reason: reason,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

//추가인력요청
export async function requestWork(shiftId, headCount, note = "") {
  try {
    const response = await api.post("/api/extra-shift/requests", {
      shiftId: shiftId,
      headcount: headCount,
      note: note,
    });
    return response;
  } catch (error) {
    console.error(error);
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
 * 특정 직원의 근무 가능 시간 조회 (사장용 API)
 *
 * @param {number} staffId - 조회할 직원의 staffId
 * @returns {Promise<Array>} - 근무 가능 시간 배열
 *
 * API 엔드포인트: GET /api/store/staff/{staffId}/availabilities
 *
 * 사장(Owner) 권한에서 사용하는 API입니다.
 * 직원 페이지에서는 /api/me/availabilities를 사용합니다.
 */
export async function fetchEmployeeAvailabilities(staffId) {
  if (!staffId) {
    const error = new Error("staffId가 없습니다.");
    console.error("❌ fetchEmployeeAvailabilities:", error.message, {
      staffId,
    });
    throw error;
  }

  try {
    // 디버깅: 요청 정보 로깅
    console.log(`🔍 [API 요청] 직원 근무 가능 시간 조회:`, {
      endpoint: `/api/store/staff/${staffId}/availabilities`,
      staffId,
      fullURL: `${api.defaults.baseURL}/api/store/staff/${staffId}/availabilities`,
    });

    const response = await api.get(
      `/api/store/staff/${staffId}/availabilities`,
    );

    // 디버깅: 성공 응답 로깅
    console.log(`✅ [API 성공] 직원 근무 가능 시간 조회:`, {
      staffId,
      dataCount: Array.isArray(response.data) ? response.data.length : 0,
      data: response.data,
    });

    return response.data || [];
  } catch (error) {
    // 디버깅: 상세 에러 로깅
    console.error(`🚨 [API 실패] 직원 ID:${staffId} 근무 가능시간 요청 실패:`, {
      staffId,
      endpoint: `/api/store/staff/${staffId}/availabilities`,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
    });

    // 500 에러인 경우 상세 정보 출력
    if (error.response?.status === 500) {
      console.error("⚠️ [서버 500 에러 상세]:", {
        requestURL: error.config?.url,
        requestMethod: error.config?.method,
        requestHeaders: error.config?.headers,
        responseData: error.response?.data,
        // 백엔드 개발자에게 전달할 수 있도록 상세 정보
        serverError: {
          message: error.response?.data?.message || "서버 내부 오류",
          timestamp: new Date().toISOString(),
          path: error.config?.url,
          method: error.config?.method?.toUpperCase(),
        },
      });
    }

    // ❗ 에러를 그대로 throw하여 호출하는 쪽에서 처리할 수 있도록 함
    throw error;
  }
}
