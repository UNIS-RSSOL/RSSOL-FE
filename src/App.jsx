import { Routes, Route, useLocation } from "react-router-dom";
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
import AlarmHomeEmp from "./pages/employee/alarm/AlarmHomeEmp.jsx";
import AlarmHome from "./pages/owner/alarm/AlarmHome.jsx";
import AlarmCheck from "./pages/owner/alarm/AlarmCheck.jsx";

import CalAddEmp from "./pages/employee/calendarAdd/CalAddEmp.jsx";
import CalAdd from "./pages/owner/calendarAdd/CalAdd.jsx";
import CalGen from "./pages/owner/calendarAdd/CalGen.jsx";
import AutoCal from "./pages/owner/calendarAdd/AutoCal.jsx";
import AddOwner from "./pages/owner/calendarAdd/AddOwner.jsx";
import ScheduleList from "./pages/owner/calendarAdd/ScheduleList.jsx";

import ManageEmpPage from "./pages/owner/manage/ManageEmpPage.jsx";
import ManageSalary from "./pages/employee/manage/manageSalary.jsx";
import OwnerHome from "./pages/owner/OwnerHome.jsx";
import EmpHome from "./pages/employee/EmpHome.jsx";

function App() {
  const location = useLocation();
  console.log("📍 Current Path:", location.pathname);

  // 헤더·푸터 제외할 페이지
  const hideLayoutPaths = [
    "/",
    "/login",
    "/onboarding",
    "/auth/kakao/callback",
    "/calAdd",
    "/calGen",
    "/autoCal",
    "/calAddEmp",
    "/addOwner",
    "/scheduleList",
    "/alarmHomeEmp",
    "/alarmHome",
    "/alarmCheck",
  ];
  const hideLayout = hideLayoutPaths.some((path) => {
    // 루트 경로 (정확히 "/"만 일치)
    if (path === "/" && location.pathname === "/") {
      return true;
    }
    // 나머지 경로 (정확히 일치하거나, 해당 경로로 시작하는 하위 경로)
    if (
      path !== "/" &&
      (location.pathname === path || location.pathname.startsWith(path + "/"))
    ) {
      return true;
    }
    return false;
  });

  return (
    <div className="w-[393px] bg-[#F8FBFE] min-[393px]:w-[393px] mx-auto h-screen flex flex-col font-Pretendard">
      {!hideLayout && <Header />}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Login />} />
          {/* 로그인/온보딩 */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          {/* 
            카카오 로그인 콜백 라우트
            주의: OAuth 인증 코드(code)는 백엔드에서 처리합니다.
            백엔드가 인증 완료 후 이 경로로 리다이렉트합니다.
            이 페이지에서 세션 확인 후 적절한 페이지로 이동합니다.
            - 신규 회원 또는 온보딩 미실행 → /onboarding
            - 기존 회원(온보딩 실행) → 사장: /owner, 알바: /employee
          */}
          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />

          <Route path="/owner" element={<OwnerHome />} />
          <Route path="/employee" element={<EmpHome />} />

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

          <Route path="/calAddEmp" element={<CalAddEmp />} />
          <Route path="/calAdd" element={<CalAdd />} />
          <Route path="/calGen" element={<CalGen />} />
          <Route path="/autoCal" element={<AutoCal />} />
          <Route path="/addOwner" element={<AddOwner />} />
          <Route path="/scheduleList" element={<ScheduleList />} />

          <Route path="/alarmHomeEmp" element={<AlarmHomeEmp />} />
          <Route path="/alarmHome" element={<AlarmHome />} />
          <Route path="/alarmCheck" element={<AlarmCheck />} />

          <Route path="/owner/manageemp" element={<ManageEmpPage />} />
          <Route path="/employee/managesalary" element={<ManageSalary />} />

          <Route path="/owner/calendar" element={<OwnerCalendar />} />
          <Route path="/employee/calendar" element={<EmpCalendar />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
