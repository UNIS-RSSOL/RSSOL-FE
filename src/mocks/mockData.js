/**
 * 목업 데이터 모음
 * ─────────────────────────────────────────────
 * API 연결 완료 후 이 파일과 import를 제거하면 됩니다.
 * 각 컴포넌트에서 import { MOCK_XXX } from "@/mocks/mockData" 로 사용합니다.
 * ─────────────────────────────────────────────
 */
import dayjs from "dayjs";

/* ── 홈 화면용 오늘 일정 (OwnerHome, EmpHome) ── */
export const MOCK_TODAY_SCHEDULES = [
  {
    id: "mock-1",
    storeName: "투썸 신촌점",
    startDatetime: dayjs().hour(8).minute(0).second(0).format(),
    endDatetime: dayjs().hour(12).minute(0).second(0).format(),
  },
  {
    id: "mock-2",
    storeName: "연일밥집",
    startDatetime: dayjs().hour(11).minute(0).second(0).format(),
    endDatetime: dayjs().hour(15).minute(0).second(0).format(),
  },
];

/* ── 홈 화면용 할 일 목록 (OwnerHome, EmpHome) ── */
export const MOCK_TODOS = [
  { id: 1, text: "마감 조 청소", done: false },
  { id: 2, text: "오픈 조 청소", done: true },
  { id: 3, text: "마감 조 청소", done: false },
  { id: 4, text: "마감 조 청소", done: false },
];

/* ── 캘린더용 근무자 목록 (DayCalendar, WeekCalendar) ── */
export const MOCK_WORKERS = [
  { userStoreId: "mock-1", username: "정지유" },
  { userStoreId: "mock-2", username: "이시은" },
  { userStoreId: "mock-3", username: "유채은" },
];

/* ── 일간 캘린더용 이벤트 생성 ── */
export const createMockDayEvents = (dateStr) => [
  {
    id: "mock-ev-1",
    userStoreId: "mock-1",
    username: "정지유",
    start: `${dateStr}T08:00`,
    end: `${dateStr}T13:00`,
  },
  {
    id: "mock-ev-2",
    userStoreId: "mock-2",
    username: "이시은",
    start: `${dateStr}T10:00`,
    end: `${dateStr}T14:00`,
  },
  {
    id: "mock-ev-3",
    userStoreId: "mock-3",
    username: "유채은",
    start: `${dateStr}T08:00`,
    end: `${dateStr}T11:00`,
  },
];

/* ── 주간 캘린더용 이벤트 생성 ── */
export const createMockWeekEvents = (startOfWeek) => [
  {
    id: "mock-w-1",
    userStoreId: "mock-1",
    username: "정지유",
    start: `${startOfWeek.add(1, "day").format("YYYY-MM-DD")}T08:00`,
    end: `${startOfWeek.add(1, "day").format("YYYY-MM-DD")}T13:00`,
  },
  {
    id: "mock-w-2",
    userStoreId: "mock-1",
    username: "정지유",
    start: `${startOfWeek.add(4, "day").format("YYYY-MM-DD")}T08:00`,
    end: `${startOfWeek.add(4, "day").format("YYYY-MM-DD")}T13:00`,
  },
  {
    id: "mock-w-3",
    userStoreId: "mock-1",
    username: "정지유",
    start: `${startOfWeek.add(6, "day").format("YYYY-MM-DD")}T10:00`,
    end: `${startOfWeek.add(6, "day").format("YYYY-MM-DD")}T15:00`,
  },
  {
    id: "mock-w-4",
    userStoreId: "mock-2",
    username: "이시은",
    start: `${startOfWeek.add(2, "day").format("YYYY-MM-DD")}T09:00`,
    end: `${startOfWeek.add(2, "day").format("YYYY-MM-DD")}T14:00`,
  },
  {
    id: "mock-w-5",
    userStoreId: "mock-2",
    username: "이시은",
    start: `${startOfWeek.add(5, "day").format("YYYY-MM-DD")}T10:00`,
    end: `${startOfWeek.add(5, "day").format("YYYY-MM-DD")}T15:00`,
  },
  {
    id: "mock-w-6",
    userStoreId: "mock-3",
    username: "유채은",
    start: `${startOfWeek.add(0, "day").format("YYYY-MM-DD")}T08:00`,
    end: `${startOfWeek.add(0, "day").format("YYYY-MM-DD")}T12:00`,
  },
];
