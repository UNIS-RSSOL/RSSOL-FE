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
import {
  getScheduleByPeriod,
  getMyScheduleByPeriod,
} from "../services/WorkShiftService.js";
import { getTodos, toggleTodoComplete } from "../services/TodoService.js";
import {
  getTodayAttendance,
  checkIn,
  checkOut,
} from "../services/AttendanceService.js";

export default function useHomePage(role) {
  const navigate = useNavigate();
  const today = dayjs();

  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });
  const [storeList, setStoreList] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [myTodayShift, setMyTodayShift] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [todos, setTodos] = useState({ STORE: [], HANDOVER: [], PERSONAL: [] });
  const [attendance, setAttendance] = useState(null); // 오늘 출퇴근 상태

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

        if (role === "owner") {
          // 매장 전체 스케줄 (MiniTimeline용)
          const storeSchedules = await getScheduleByPeriod(todayStr, todayStr);
          if (storeSchedules && storeSchedules.length > 0) {
            setTodaySchedules(storeSchedules);
          }
          // 본인 스케줄 (근무시간 표시용)
          const mySchedules = await getMyScheduleByPeriod(todayStr, todayStr);
          if (mySchedules && mySchedules.length > 0) {
            setMyTodayShift(mySchedules[0]);
          }
        } else {
          const mySchedules = await getMyScheduleByPeriod(todayStr, todayStr);
          if (mySchedules && mySchedules.length > 0) {
            setTodaySchedules(mySchedules);
            setMyTodayShift(mySchedules[0]);
          }
        }

        // 오늘 할 일 조회 (전체 카테고리)
        try {
          const todoRes = await getTodos(todayStr);
          setTodos({
            STORE: todoRes.storeTodos || [],
            HANDOVER: todoRes.handoverTodos || [],
            PERSONAL: todoRes.personalTodos || [],
          });
        } catch {
          // 할 일 조회 실패 시 무시
        }

        // 오늘 출퇴근 상태 조회
        try {
          const att = await getTodayAttendance();
          setAttendance(att);
        } catch {
          // 출퇴근 상태 조회 실패 시 무시
        }
      } catch (error) {
        console.error("홈 데이터 로딩 실패:", error);
        // 목업 데이터 유지
      }
    })();
  }, []);

  const todayShift = myTodayShift;

  /* ── 할 일 토글 ── */
  const toggleTodo = async (id) => {
    try {
      await toggleTodoComplete(id);
      setTodos((prev) => {
        const updated = {};
        for (const key of Object.keys(prev)) {
          updated[key] = prev[key].map((t) =>
            t.id === id ? { ...t, done: !t.done } : t,
          );
        }
        return updated;
      });
    } catch (error) {
      console.error("할 일 토글 실패:", error);
    }
  };

  /* ── 출근 처리 ── */
  const handleCheckIn = async () => {
    try {
      const res = await checkIn();
      setAttendance(res);
    } catch (error) {
      console.error("출근 실패:", error);
      alert(error.response?.data?.message || "출근 처리에 실패했습니다.");
    }
  };

  /* ── 퇴근 처리 ── */
  const handleCheckOut = async () => {
    try {
      const res = await checkOut();
      setAttendance(res);
    } catch (error) {
      console.error("퇴근 실패:", error);
      alert(error.response?.data?.message || "퇴근 처리에 실패했습니다.");
    }
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
    attendance,
    sidebarOpen,
    setSidebarOpen,
    isAppModalOpen,
    setIsAppModalOpen,
    handleCheckIn,
    handleCheckOut,
    handleStoreChange,
    handleLogout,
    navigate,
  };
}
