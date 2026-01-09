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
    // 토큰 확인
    const token = localStorage.getItem("accessToken");
    const endpoint = `/api/store/staff/${staffId}/availabilities`;
    const fullURL = `${api.defaults.baseURL}${endpoint}`;

    console.log(`🔍 [조회 API] 직원 근무 가능 시간 조회 요청:`, {
      endpoint,
      fullURL,
      method: "GET",
      staffId,
      staffIdType: typeof staffId,
      tokenExists: !!token,
      tokenLength: token?.length || 0,
    });

    const response = await api.get(endpoint);

    // ✅ 정상 응답 처리 (200 OK)
    // Swagger 기준 정상 응답 형태:
    // {
    //   "status": 200,
    //   "data": [
    //     {
    //       "id": 1,
    //       "staffId": 2,
    //       "startDatetime": "2024-01-15T09:00:00",
    //       "endDatetime": "2024-01-15T18:00:00",
    //       "dayOfWeek": "MONDAY"
    //     }
    //   ]
    // }
    // 또는 단순 배열: [{ ... }, { ... }]

    // 응답 데이터 정규화 (응답이 객체로 감싸져 있는 경우 처리)
    let availabilities = response.data;
    
    // 응답이 객체이고 내부에 배열이 있는 경우
    if (availabilities && typeof availabilities === 'object' && !Array.isArray(availabilities)) {
      if (availabilities.data && Array.isArray(availabilities.data)) {
        availabilities = availabilities.data;
      } else if (availabilities.availabilities && Array.isArray(availabilities.availabilities)) {
        availabilities = availabilities.availabilities;
      } else if (availabilities.content && Array.isArray(availabilities.content)) {
        availabilities = availabilities.content;
      }
    }

    // 최종 검증: 배열이어야 함
    if (!Array.isArray(availabilities)) {
      console.warn(`⚠️ [응답 형식 오류] 직원 ID:${staffId} - 응답이 배열이 아닙니다:`, {
        originalData: response.data,
        normalizedData: availabilities,
        dataType: typeof availabilities,
      });
      return [];
    }

    // 디버깅: 성공 응답 로깅
    console.log(`✅ [조회 API] 직원 근무 가능 시간 조회 성공:`, {
      status: response.status,
      statusText: response.statusText,
      staffId,
      dataCount: availabilities.length,
      // 첫 번째 항목 구조 확인 (Swagger 스키마 검증용)
      dataStructure: availabilities.length > 0 ? {
        firstItemKeys: Object.keys(availabilities[0]),
        firstItem: availabilities[0],
        예상필드: ['id', 'staffId', 'startDatetime', 'endDatetime', 'dayOfWeek'],
      } : "빈 배열 (정상)",
    });

    return availabilities;
  } catch (error) {
    const status = error.response?.status;
    const errorDetails = {
      staffId,
      staffIdType: typeof staffId,
      endpoint: `/api/store/staff/${staffId}/availabilities`,
      status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      errorMessage: error.message,
    };

    // 🔴 500 에러 (백엔드 내부 서버 오류) - 방어적 처리
    // 백엔드에서 데이터 없음 처리 안 한 경우 빈 배열로 반환
    if (status === 500) {
      console.warn(
        `⚠️ [백엔드 500 에러 - 방어 처리] 직원 ID:${staffId} 근무 가능 시간 데이터 없음 (서버 오류)`,
        {
          ...errorDetails,
          처리: "빈 배열 반환 (백엔드 수정 필요)",
          원인추정: [
            "1. 해당 직원의 availabilities 데이터가 DB에 없음",
            "2. 백엔드에서 null/빈 데이터 처리 로직 누락",
            "3. LazyInitializationException 또는 무한 참조 오류",
          ],
          백엔드체크리스트: [
            "Swagger에서 직접 호출하여 500 재현 확인",
            "DB에서 SELECT * FROM availability WHERE staff_id = ? 확인",
            "컨트롤러/서비스에서 빈 데이터 처리 로직 추가 필요",
          ],
          백엔드수정예시: `if (list == null || list.isEmpty()) {
  return ResponseEntity.ok(Collections.emptyList());
}`,
        },
      );

      // 백엔드 개발자용 상세 정보 (Swagger 테스트 및 DB 확인용)
      console.error("📋 [백엔드 개발자용 디버깅 정보]:", {
        endpoint: `/api/store/staff/${staffId}/availabilities`,
        method: "GET",
        status: 500,
        staffId: staffId,
        staffIdType: typeof staffId,
        errorMessage:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "서버 내부 오류",
        fullErrorData: error.response?.data,
        requestURL: error.config?.url,
        체크사항: {
          swagger테스트: `Swagger UI에서 GET /api/store/staff/${staffId}/availabilities 직접 호출`,
          db확인: `SELECT * FROM availability WHERE staff_id = ${staffId}`,
          코드확인: "컨트롤러에서 빈 리스트 반환 처리 여부 확인",
        },
      });

      // ✅ 방어 처리: 빈 배열 반환 (백엔드 수정 전까지 임시 조치)
      return [];
    }

    // 🔴 404 에러 (직원을 찾을 수 없음) - 빈 배열 반환
    if (status === 404) {
      console.warn(
        `⚠️ 직원 ID:${staffId}를 찾을 수 없습니다 (404). 빈 배열 반환`,
        errorDetails,
      );
      return [];
    }

    // 🔴 기타 에러 (401, 403 등) - 에러 throw하여 상위에서 처리
    console.error(
      `🚨 [API 실패] 직원 ID:${staffId} 근무 가능시간 요청 실패:`,
      errorDetails,
    );

    throw error;
  }
}
