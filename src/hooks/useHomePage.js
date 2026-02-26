/**
 * 홈 화면 공통 로직 훅 (OwnerHome, EmpHome 공유)
 *
 * @param {"owner"|"employee"} role - 사용자 역할
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import {
  getActiveStore,
  getOwnerStoreList,
  getStaffStoreList,
  changeActiveStore,
} from "../services/MypageService.js";
import { getScheduleByPeriod } from "../services/WorkShiftService.js";
import { getMyScheduleByPeriod } from "../services/WorkShiftService.js";

import { MOCK_TODAY_SCHEDULES, MOCK_TODOS } from "../mocks/mockData.js";

export default function useHomePage(role) {
  const navigate = useNavigate();
  const today = dayjs();

  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });
  const [storeList, setStoreList] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState(MOCK_TODAY_SCHEDULES); // TODO: API 연결 후 빈 배열로 변경
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [todos, setTodos] = useState(MOCK_TODOS); // TODO: API 연결 후 빈 배열로 변경

  /* ── 초기 데이터 로딩 ── */
  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStore({ storeId: active.storeId, name: active.name });

        const stores =
          role === "owner"
            ? await getOwnerStoreList()
            : await getStaffStoreList();
        setStoreList(stores);

        const todayStr = today.format("YYYY-MM-DD");
        const schedules =
          role === "owner"
            ? await getScheduleByPeriod(todayStr, todayStr)
            : await getMyScheduleByPeriod(todayStr, todayStr);

        if (schedules && schedules.length > 0) {
          setTodaySchedules(schedules);
        }
        // else: 목업 데이터 유지
      } catch (error) {
        console.error("홈 데이터 로딩 실패:", error);
        // 목업 데이터 유지
      }
    })();
  }, []);

  const todayShift = todaySchedules[0];

  /* ── 할 일 토글 ── */
  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  /* ── 출근 처리 ── */
  const isInApp = () =>
    typeof window !== "undefined" && !!window.ReactNativeWebView;

  const handleCheckIn = () => {
    if (!isInApp()) {
      setIsAppModalOpen(true);
      return;
    }
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ action: "goToGPS" }),
    );
  };

  /* ── 매장 전환 ── */
  const handleStoreChange = async (storeId) => {
    try {
      const res = await changeActiveStore(storeId);
      setActiveStore({ storeId: res.storeId, name: res.name });
      setSidebarOpen(false);
    } catch (error) {
      console.error("매장 전환 실패:", error);
    }
  };

  /* ── 로그아웃 ── */
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  };

  return {
    today,
    activeStore,
    storeList,
    todaySchedules,
    todayShift,
    todos,
    toggleTodo,
    sidebarOpen,
    setSidebarOpen,
    isAppModalOpen,
    setIsAppModalOpen,
    handleCheckIn,
    handleStoreChange,
    handleLogout,
    navigate,
  };
}
