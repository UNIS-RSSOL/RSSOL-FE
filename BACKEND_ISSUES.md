# 백엔드 이슈 및 수정 요청 사항

## 1. 근무표 생성 요청 API - storeId 누락 문제 ⚠️ (프론트엔드 수정 완료, 백엔드 확인 필요)

**에러 메시지:**
```
could not execute statement [Field 'storeId' doesn't have a default value] 
[insert into notifications (category, crea...]
```

**문제:**
- `POST /api/schedules/requests` API 호출 시 `storeId`가 요청 body에 포함되지 않음
- 백엔드에서 알림 생성 시 `notifications` 테이블에 `storeId`가 필수인데 값이 없어서 DB 에러 발생

**프론트엔드 해결:**
- ✅ 프론트엔드 수정 완료: 요청 body에 `storeId` 필드 추가
- 프론트엔드에서 전송하는 데이터:
```json
{
  "storeId": 123,  // camelCase로 전송
  "openTime": "09:00:00",
  "closeTime": "13:00:00",
  "startDate": "2026-01-13",
  "endDate": "2026-01-28",
  "timeSegments": [...]
}
```

**백엔드 확인 필요:**
1. **컬럼명/필드명 불일치 문제:**
   - 데이터베이스 컬럼명: `store_id` (snake_case)
   - Java 필드명: `storeId` (camelCase)
   - `@Column(name = "store_id", nullable = false)` 매핑은 올바름
   
2. **확인 사항:**
   - `POST /api/schedules/requests` 엔드포인트가 요청 body의 `storeId` (camelCase)를 올바르게 받는지
   - 알림 생성 시 `notifications` 테이블에 `store_id` 컬럼에 값이 올바르게 저장되는지
   - 어딘가에서 `store_id`와 `storeId`를 혼용해서 사용하는 부분이 없는지 확인
   - JSON 역직렬화 시 필드명 매핑이 올바른지 확인

**주의:**
- 프론트엔드는 `storeId` (camelCase)로 전송
- 백엔드는 이를 받아서 `store_id` (snake_case) 컬럼에 저장해야 함
- JPA 매핑이 올바르게 되어 있는지 확인 필요

---

## 2. 대타 요청 API - 비즈니스 로직 문제

**에러 메시지:**
```
본인 근무에 대해서만 대타 요청을 생성할 수 있습니다.
```

**문제:**
- Owner가 다른 직원의 근무에 대해 대타 요청을 생성하려고 할 때 500 에러 발생
- 비즈니스 로직상 Owner는 다른 직원의 근무에 대해서도 대타 요청을 생성할 수 있어야 함

**요청 사항:**
- `POST /api/shift-swap/requests` API에서 Owner 권한일 때는 본인 근무가 아니어도 대타 요청을 생성할 수 있도록 수정
- 또는 에러 메시지를 더 명확하게 변경 (예: "직원은 본인 근무에 대해서만 대타 요청을 생성할 수 있습니다")

**현재 동작:**
- Owner가 OwnerCalendar에서 일정 클릭 → 대타 요청하기 클릭 시 500 에러 발생

**기대 동작:**
- Owner는 매장 내 모든 직원의 근무에 대해 대타 요청을 생성할 수 있어야 함

---

## 3. 인력 요청 API - 데이터베이스 에러

**에러 메시지:**
```
could not execute statement [Column 'store_id' can...alues (?,?,?,?,?,?,...)
```

**문제:**
- `POST /api/extra-shift/requests` API 호출 시 데이터베이스 INSERT 쿼리 실패
- `store_id` 컬럼 관련 문제 (NULL 값 또는 잘못된 값 전달 가능성)

**요청 사항:**
1. `POST /api/extra-shift/requests` API에서 `store_id` 값이 올바르게 전달되고 있는지 확인
2. 요청 body에 `storeId` 또는 `store_id` 필드가 필요한지 확인
3. 현재 `shiftId`만 전달하고 있는데, `storeId`도 함께 전달해야 하는지 확인

**현재 프론트엔드 전송 데이터:**
```json
{
  "shiftId": 123,
  "headcount": 1,
  "note": ""
}
```

**확인 필요:**
- `shiftId`로부터 `storeId`를 자동으로 조회하는지
- 아니면 요청 body에 `storeId`를 명시적으로 포함해야 하는지

---

## 4. 스케줄 조회 API - 매장의 모든 직원 스케줄이 반환되지 않는 문제

**문제:**
- `GET /api/schedules/store/week` API 호출 시 매장의 모든 직원 스케줄이 반환되지 않음
- 현재 `storeId: 1` 파라미터를 전달하고 있지만, 응답에는 일부 직원(`알바3`, `알바1`)만 포함됨
- 사장 캘린더에는 같은 매장에 있는 모든 알바생의 일정이 표시되어야 함

**현재 동작:**
- 프론트엔드에서 `storeId` 파라미터를 전달: `?start=2026-01-13&end=2026-01-13&storeId=1`
- API 호출 성공 (200 OK)
- 응답에 일부 직원만 포함됨

**확인 필요 사항:**
1. 백엔드 API가 `storeId` 쿼리 파라미터를 받는지 확인
2. 백엔드가 토큰에서 활성 매장을 자동으로 가져오는 경우, 해당 매장의 모든 직원 스케줄을 반환하는지 확인
3. 백엔드 쿼리에서 매장의 모든 직원 스케줄을 조회하는지 확인

**요청 사항:**
- `GET /api/schedules/store/week` API가 매장의 모든 직원 스케줄을 반환하도록 수정
- 또는 `storeId` 파라미터를 받아서 해당 매장의 모든 직원 스케줄을 반환하도록 수정

---

## 요약

1. ✅ **근무표 생성 요청**: 프론트엔드 수정 완료 (문자열 형식으로 전송)
2. ⚠️ **대타 요청**: 백엔드 비즈니스 로직 수정 필요 (Owner 권한 처리)
3. ⚠️ **인력 요청**: 백엔드 데이터베이스 쿼리 수정 필요 (store_id 처리)
4. ⚠️ **스케줄 조회**: 백엔드 API 수정 필요 (매장의 모든 직원 스케줄 반환)