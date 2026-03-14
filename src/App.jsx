import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import "./App.css";
import "./index.css";

import Header from "./components/layout/header/Header.jsx";
import Footer from "./components/layout/footer/Footer.jsx";

import Login from "./pages/auth/Login.jsx";
import Onboarding from "./pages/auth/Onboarding.jsx";
import KakaoCallback from "./pages/auth/KakaoCallback.jsx";
import OwnerPage from "./pages/owner/mypage/OwnerPage.jsx";
import OwnerManageStore from "./pages/owner/mypage/ManageStore.jsx";
import OwnerCalendar from "./pages/owner/calendar/OwnerCalendar.jsx";
import EmpCalendar from "./pages/employee/calendar/EmpCalendar.jsx";
import EmployeePage from "./pages/employee/mypage/EmployeePage.jsx";
import EmpManageStore from "./pages/employee/mypage/ManageStore.jsx";
import EmpNotification from "./pages/employee/notification/EmpNotification.jsx";
import NotificationHome from "./pages/owner/notification/NotificationHome.jsx";
import NotificationCheck from "./pages/owner/notification/NotificationCheck.jsx";
import EmpModifying from "./pages/employee/schedule/EmpModifying.jsx";
import AddSchedule from "./pages/owner/schedule/AddSchedule.jsx";
import GenSchedule from "./pages/owner/schedule/GenSchedule.jsx";
import CandidateSchedule from "./pages/owner/schedule/CandidateSchedule.jsx";
import OwnerSchedule from "./pages/owner/schedule/OwnerSchedule.jsx";
import ScheduleList from "./pages/owner/schedule/ScheduleList.jsx";
import AllStaff from "./pages/owner/manage/AllStaff.jsx";
import ManageWage from "./pages/owner/manage/ManageWage.jsx";
import EmployeeProfile from "./pages/owner/manage/EmployeeProfile.jsx";
import ManageSalary from "./pages/employee/manage/manageSalary.jsx";
import OwnerHome from "./pages/owner/OwnerHome.jsx";
import StoreSettings from "./pages/owner/StoreSettings.jsx";
import EmpHome from "./pages/employee/EmpHome.jsx";
import OwnerTodo from "./pages/owner/OwnerTodo.jsx";
import EmployeeTodo from "./pages/employee/EmployeeTodo.jsx";
import Splash from "./pages/common/Splash.jsx";

import { refreshAccessToken } from "./services/kakaoLogin.js";
import api from "./services/Api.js";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  /** -------------------------
   *  공통 Redirect Helper
   --------------------------*/
  const goLogin = () => navigate("/login", { replace: true });
  const goOnboarding = () => navigate("/onboarding", { replace: true });
  const goHomeByRole = async () => {
    try {
      await api.get("mypage/owner/profile");
      return navigate("/owner", { replace: true });
    } catch (_) {
      // 2) 알바일 가능성 체크
      try {
        await api.get("mypage/staff/profile");
        return navigate("/employee", { replace: true });
      } catch (err2) {
        return goLogin();
      }
    }
  };

  /** -------------------------
   *  Access / Refresh 인증 처리
   --------------------------*/
  const checkAuthAndRedirect = useCallback(async () => {
    setIsCheckingAuth(true);

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      // 🚫 refreshToken 없음 → 로그인 안한 상태
      if (!refreshToken) {
        if (location.pathname === "/" || location.pathname === "/login")
          goLogin();
        return;
      }

      /** 🔄 AccessToken 갱신 시도 */
      let hasValidToken = false;

      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) hasValidToken = true;
      } catch (err) {
        const status = err.response?.status;

        // refreshToken 만료
        if (status === 401 || status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          goLogin();
          return;
        }

        // 서버 오류 → 기존 accessToken 있으면 사용
        const existing = localStorage.getItem("accessToken");
        if (existing) hasValidToken = true;
      }

      // accessToken 확인
      if (!localStorage.getItem("accessToken") && !hasValidToken) {
        goOnboarding();
        return;
      }

      /** -------------------------
       *  온보딩 완료 여부 → 활성 매장 체크
       --------------------------*/
      let activeStore = null;
      try {
        const res = await api.get("mypage/active-store");
        activeStore = res.data;
      } catch (err) {
        // 매장 없음 → 역할에 따라 홈으로 이동 (알바는 active-store 없어도 정상)
        const status = err.response?.status;
        if (status === 401) return goLogin();
        // active-store 없는 사용자 = 알바도 포함. goOnboarding 금지
        if (location.pathname === "/" || location.pathname === "/login") {
          return goHomeByRole();
        }
        return;
      }

      if (!activeStore?.storeId) {
        // active-store 없는 사용자 = 알바도 포함. goOnboarding 금지
        if (location.pathname === "/" || location.pathname === "/login") {
          return goHomeByRole();
        }
        return;
      }

      /** -------------------------
       *  사용자 역할 확인
       --------------------------*/
      if (location.pathname === "/" || location.pathname === "/login") {
        await goHomeByRole();
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) return goLogin();
      // active-store 없는 사용자 = 알바도 포함. goOnboarding 금지
      if (location.pathname === "/" || location.pathname === "/login") {
        return goHomeByRole();
      }
    } finally {
      setIsCheckingAuth(false);
    }
  }, [location.pathname, navigate]);

  /** -------------------------
   *  루트에서만 인증 체크
   --------------------------*/
  // useEffect(() => {
  //   // 인증 체크가 필요한 경로
  //   const checkPages = ["/"];
  //   // 인증 체크가 불필요한 경로
  //   const publicPages = ["/", "/login", "/onboarding", "/auth/kakao/callback"];

  //   //2025-12-04: mypage, calendar 토큰 파싱 문제
  //   const AccessToken = localStorage.getItem("accessToken");
  //   const RefreshToken = localStorage.getItem("refreshToken");

  //   //토큰 둘 다 없음 → publicPages 외부 접근 차단
  //   if (!AccessToken && !RefreshToken) {
  //     if (!publicPages.includes(location.pathname)) {
  //       navigate("/login", { replace: true });
  //     }
  //     return;
  //   }

  //   if (checkPages.includes(location.pathname)) {
  //     checkAuthAndRedirect();
  //   }
  // }, [location.pathname, checkAuthAndRedirect]);

  /** -------------------------
   *  레이아웃 제외 경로
   --------------------------*/
  const hideLayoutPages = [
    "/",
    "/login",
    "/onboarding",
    "/auth/kakao/callback",
    "/owner/schedule/add",
    "/calAdd",
    "/owner/schedule/gen",
    "/owner/schedule/candidate",
    "/employee/schedule/modifying",
    "/owner/schedule/my",
    "/owner/schedule/list",
    "/employee/notification",
    "/owner/notification/home",
    "/owner/notification/check",
    "/employee/notification",
    "/owner/mypage",
    "/employee/mypage",
    "/owner/store-settings",
    "/owner/calendar",
    "/employee/calendar",
    "/owner/todo",
    "/employee/todo",
  ];

  const hideLayout =
    location.pathname === "/employee" ||
    location.pathname === "/owner" ||
    location.pathname.startsWith("/owner/manage/employee/") ||
    hideLayoutPages.some((p) =>
      p === "/" ? location.pathname === "/" : location.pathname.startsWith(p),
    );

  /** -------------------------
   *  인증 체크 중 → 스플래시
   --------------------------*/
  if (
    isCheckingAuth &&
    (location.pathname === "/" || location.pathname === "/login")
  ) {
    return <Splash />;
  }

  return (
    <div className="w-full bg-[#F8FBFE] h-screen flex flex-col font-Pretendard overflow-x-hidden">
      {!hideLayout && <Header />}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />

          {/* 홈화면 */}
          <Route path="/owner" element={<OwnerHome />} />
          <Route path="/employee" element={<EmpHome />} />

          {/* 매장 설정 */}
          <Route path="/owner/store-settings" element={<StoreSettings />} />

          {/* 마이페이지 */}
          <Route path="/owner/mypage" element={<OwnerPage />} />
          <Route
            path="/owner/mypage/managestore"
            element={<OwnerManageStore />}
          />
          <Route path="/employee/mypage" element={<EmployeePage />} />
          <Route
            path="/employee/mypage/managestore"
            element={<EmpManageStore />}
          />

          {/* 캘린더 */}
          <Route path="/employee/calendar" element={<EmpCalendar />} />
          <Route path="/owner/calendar" element={<OwnerCalendar />} />

          {/* 할 일 */}
          <Route path="/employee/todo" element={<EmployeeTodo />} />
          <Route path="/owner/todo" element={<OwnerTodo />} />

          {/* 근무표생성 */}
          <Route
            path="/employee/schedule/modifying"
            element={<EmpModifying />}
          />
          <Route path="/calAdd" element={<AddSchedule />} />
          <Route path="/owner/schedule/add" element={<AddSchedule />} />
          <Route path="/owner/schedule/gen" element={<GenSchedule />} />
          <Route
            path="/owner/schedule/candidate"
            element={<CandidateSchedule />}
          />
          <Route path="/owner/schedule/my" element={<OwnerSchedule />} />
          <Route path="/owner/schedule/list" element={<ScheduleList />} />

          {/* 알림 */}
          <Route path="/employee/notification" element={<EmpNotification />} />
          <Route
            path="/owner/notification/home"
            element={<NotificationHome />}
          />
          <Route
            path="/owner/notification/check"
            element={<NotificationCheck />}
          />

          {/*관리 페이지 */}
          <Route path="/owner/manage/employee" element={<AllStaff />} />
          <Route
            path="/owner/manage/employee/:userStoreId"
            element={<EmployeeProfile />}
          />
          <Route path="/owner/manage/wage" element={<ManageWage />} />
          <Route path="/employee/manage" element={<ManageSalary />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
