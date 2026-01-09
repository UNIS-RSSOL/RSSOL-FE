# 프론트엔드 기능 구현 현황

## 1. 사용자(사장/직원) 회원가입·로그인 기능

### UI 구현
- ✅ 로그인 페이지 (`src/pages/auth/Login.jsx`)
  - 카카오 소셜 로그인 버튼
  - 개발용 이메일 로그인 폼
  - 역할 선택 UI (사장/직원 캐릭터 버튼)
  - 자동 로그인 (토큰 확인 및 역할 기반 라우팅)
  - 에러 메시지 표시

- ✅ 온보딩 페이지 (`src/pages/auth/Onboarding.jsx`)
  - 역할 선택 (사장/직원)
  - 사장: 매장 정보 입력 폼 (매장명, 주소, 전화번호, 사업자등록번호)
  - 직원: 매장 등록번호, 입사일, 은행 계좌 정보 입력 폼
  - 폼 유효성 검증 (전화번호, 사업자등록번호, 계좌번호)
  - localStorage를 통한 입력 데이터 임시 저장
  - 단계별 UI (2단계)

- ✅ 카카오 로그인 콜백 처리 (`src/pages/auth/KakaoCallback.jsx`)

### 백엔드 연동
- ✅ JWT 토큰 기반 인증 (`src/services/api.js`)
  - Axios 인터셉터를 통한 자동 토큰 첨부
  - 401 에러 시 자동 토큰 갱신 (`refreshToken`)
  - 토큰 만료 시 자동 로그아웃 및 리다이렉트

- ✅ 인증 서비스 (`src/services/authService.js`)
  - 개발용 토큰 발급 (`getDevToken`)
  - 사장 온보딩 API (`onboardingOwner`)
  - 직원 온보딩 API (`onboardingStaff`)
  - 토큰 갱신 (`refreshToken`)
  - 로그아웃 (`logout`)

- ✅ 카카오 로그인 연동 (`src/services/kakaoLogin.js`)

---

## 2. 매장-직원 관계(UserStore) 구조 설계 및 구현

### UI 구현
- ✅ 사장 마이페이지 (`src/pages/owner/mypage/OwnerPage.jsx`)
  - 활성 매장 정보 표시 (매장 등록 코드, 매장명, 주소, 전화번호)
  - 매장 정보 수정 UI

- ✅ 사장 매장 관리 페이지 (`src/pages/owner/mypage/ManageStore.jsx`)
  - 등록된 매장 목록 표시
  - 매장 추가 UI (매장명, 주소, 전화번호, 사업자등록번호)
  - 매장 삭제 모달

- ✅ 직원 마이페이지 (`src/pages/employee/mypage/EmployeePage.jsx`)
  - 등록된 매장 정보 표시
  - 매장 목록 조회 및 표시

- ✅ 직원 매장 관리 페이지 (`src/pages/employee/mypage/ManageStore.jsx`)

### 백엔드 연동
- ✅ 사장 마이페이지 서비스 (`src/services/owner/MyPageService.js`)
  - 활성 매장 조회 (`fetchActiveStore`)
  - 매장 목록 조회 (`fetchStoreList`)
  - 매장 추가 (`addStore`)
  - 매장 삭제 (`deleteStore`)
  - 매장 정보 수정 (`updateStoredata`)

- ✅ 직원 마이페이지 서비스 (`src/services/employee/MyPageService.js`)
  - 내 정보 조회 (`fetchMydata`)
  - 매장 목록 조회 (`fetchStoreList`)
  - 활성 매장 조회 (`fetchActiveStore`)

---

## 3. 직원 근무 가능 시간 등록 기능

### UI 구현
- ✅ 직원 근무 가능 시간 등록 페이지 (`src/pages/employee/calendarAdd/CalAddEmp.jsx`)
  - 주간 캘린더 UI (`EmployeeScheduleCalendar` 컴포넌트)
  - 시간 슬롯 클릭으로 근무 가능 시간 선택
  - 선택된 시간 슬롯 시각적 표시
  - 기존 스케줄과의 중복 확인
  - 연속된 시간대 자동 병합

- ✅ 직원 근무 가능 시간 수정 페이지 (`src/pages/employee/calendarAdd/CalModEmp.jsx`)

- ✅ 캘린더 컴포넌트 (`src/components/common/calendar/EmployeeScheduleCalendar.jsx`)
  - 주간 시간표 (8시~22시)
  - 요일별 시간 슬롯 표시
  - 선택 상태 시각화

### 백엔드 연동
- ✅ 직원 스케줄 서비스 (`src/services/employee/ScheduleService.js`)
  - 근무 가능 시간 추가 (`addAvailability`)
    - 요청 형식: `{ userStoreId, userName, availabilities: [{ dayOfWeek, startTime, endTime }] }`
  - 근무 가능 시간 조회 (`fetchMyAvailabilities`)
  - 근무 가능 시간 수정 (`updateAvailability`)
  - 근무 가능 시간 삭제 (`deleteAvailability`)

- ✅ 공통 스케줄 서비스 (`src/services/common/ScheduleService.js`)
  - 기간별 스케줄 조회 (`fetchSchedules`)

---

## 4. 근무 스케줄(Shift / WorkShift) 생성 및 조정 기능

### UI 구현
- ✅ 사장 근무표 생성 페이지 (`src/pages/owner/calendarAdd/CalAdd.jsx`)
  - FullCalendar를 활용한 월간 달력
  - 날짜 범위 선택 (시작일자/마무리일자)
  - 시간 구간 설정 (시작시간, 종료시간, 필요 인원)
  - 근무표 생성 단위 선택 (지정함/지정하지 않음)
  - 최소 근무시간 설정

- ✅ 사장 근무표 자동 생성 페이지 (`src/pages/owner/calendarAdd/AutoCal.jsx`)
  - 생성된 근무표 후보 목록 표시
  - 후보 선택 및 확정

- ✅ 사장 근무표 목록 페이지 (`src/pages/owner/calendarAdd/ScheduleList.jsx`)

- ✅ 사장 근무표 추가 페이지 (`src/pages/owner/calendarAdd/AddOwner.jsx`)

- ✅ 사장 캘린더 페이지 (`src/pages/owner/calendar/OwnerCalendar.jsx`)
  - 주간/월간 스케줄 표시
  - 스케줄 이벤트 클릭 시 상세 정보 모달
  - 스케줄 수정/삭제 기능

- ✅ 직원 캘린더 페이지 (`src/pages/employee/calendar/EmpCalendar.jsx`)
  - 주간/월간 스케줄 표시
  - 내 스케줄 확인
  - 대타 요청 버튼

### 백엔드 연동
- ✅ 스케줄 서비스 (`src/services/scheduleService.js`)
  - 근무표 생성 (`generateSchedule`)
    - 요청 형식: `{ storeId, openTime, closeTime, timeSegments, candidateCount }`
  - 근무표 후보 확정 (`confirmSchedule`)

- ✅ 사장 스케줄 서비스 (`src/services/owner/ScheduleService.js`)
  - 매장 직원 목록 조회 (`fetchAllWorkers`)

- ✅ 공통 스케줄 서비스 (`src/services/common/ScheduleService.js`)
  - 기간별 스케줄 조회 (`fetchSchedules`)
    - 사장: `/api/schedules/store/week`
    - 직원: `/api/schedules/me/week`

---

## 5. 대타 기능

### UI 구현
- ✅ 직원 알림 페이지 (`src/pages/employee/alarm/AlarmHomeEmp.jsx`)
  - 대타 요청 알림 표시
  - 알림 수락/거절 버튼
  - 날짜별 알림 그룹화

- ✅ 사장 알림 페이지 (`src/pages/owner/alarm/AlarmHome.jsx`)
  - 대타 요청 알림 목록
  - 대타 요청 승인/거절 UI

- ✅ 사장 대타 확인 페이지 (`src/pages/owner/alarm/AlarmCheck.jsx`)
  - 대타 승인/거절 모달

- ✅ 캘린더에서 대타 요청
  - 사장 캘린더: 스케줄 클릭 시 "대타 요청하기" 버튼
  - 직원 캘린더: 스케줄 클릭 시 "대타 요청하기" 버튼

### 백엔드 연동
- ✅ 대타 요청 서비스 (`src/services/common/ScheduleService.js`)
  - 대타 요청 생성 (`requestSub`)
    - 엔드포인트: `POST /api/shift-swap/requests`
    - 요청 형식: `{ shiftId, reason }`

- ✅ 알림 서비스 (`src/services/common/NotificationService.js`)
  - 알림 조회 (`fetchNotifications`)
    - 엔드포인트: `GET /api/shift-swap/notifications`
  - 알림 타입: `SCHEDULE_REQUEST`, `SHIFT_SWAP_REQUEST` 등

- ✅ 알림 서비스 (`src/services/common/AlarmService.js`)
  - 알림 조회 (`fetchAlarm`)

---

## 6. 월별 급여 집계(ScheduleSummary) - 구현 중

### UI 구현
- ✅ 직원 급여 관리 페이지 (`src/pages/employee/manage/manageSalary.jsx`)
  - 월별 급여 조회 UI
  - 급여 상세 정보 표시 (급여, 주휴수당, 연장근로, 야간근로)
  - 총 급여 계산 및 표시
  - 월별 근태 확인 (출근, 지각, 결근, 연장 시간)
  - 월 선택 UI (이전/다음 월 이동)
  - ⚠️ 현재 하드코딩된 데이터 표시 (백엔드 연동 필요)

### 백엔드 연동
- ✅ 급여 서비스 (`src/services/employee/WageService.js`)
  - 월별 급여 조회 (`fetchWage`)
    - 엔드포인트: `GET /api/payrolls/preview/monthly`
    - 파라미터: `store_id`, `user_store_id`, `month`
  - ⚠️ UI와 백엔드 연동 미완료 (데이터 바인딩 필요)

- ✅ 사장 급여 서비스 (`src/services/owner/WageService.js`)

---

## 7. 급여 REST API 제외 완료

### 상태
- ✅ 급여 관련 REST API는 백엔드에서 제외됨
- ✅ 프론트엔드에서는 급여 조회 UI만 구현 (데이터는 하드코딩 또는 미연동 상태)

---

## 공통 기능

### UI 컴포넌트
- ✅ 레이아웃 컴포넌트
  - 헤더 (`src/components/layout/header/Header.jsx`)
  - 푸터/하단 네비게이션 (`src/components/layout/footer/Footer.jsx`)
  - 상단 바 (`src/components/layout/alarm/TopBar.jsx`)

- ✅ 공통 컴포넌트
  - 모달 (`src/components/common/Modal.jsx`)
  - 토스트 (`src/components/common/Toast.jsx`)
  - 버튼 (`GreenBtn`, `WhiteBtn`)
  - 캘린더 (`TimeSlotCalendar`, `EmployeeScheduleCalendar`)

### 백엔드 연동 인프라
- ✅ API 클라이언트 (`src/services/api.js`)
  - Axios 인스턴스 설정
  - 요청 인터셉터 (JWT 토큰 자동 첨부)
  - 응답 인터셉터 (토큰 갱신, 에러 처리)
  - Base URL: `https://connecti.store`

- ✅ 라우팅 (`src/App.jsx`)
  - 역할 기반 라우팅 (사장/직원)
  - 보호된 라우트 (인증 필요)

---

## 기술 스택

**Language:** JavaScript (ES6+)  
**Framework:** React 19  
**Build Tool:** Vite 7  
**Auth:** JWT (토큰 기반 인증)  
**State Management:** React Context API  
**HTTP Client:** Axios  
**UI Library:** Ant Design 5  
**Styling:** Tailwind CSS 4  
**Routing:** React Router DOM 7  
**Calendar:** FullCalendar, TUI Calendar  
**Animation:** Framer Motion  
**Icons:** Lucide React  
**Date Utility:** Day.js  
**Infra / DevOps:** Vercel, GitHub Actions (CI/CD)  
**API:** RESTful API
