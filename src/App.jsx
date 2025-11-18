import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";
import Header from "./components/layout/header/Header.jsx";
import Footer from "./components/layout/footer/Footer.jsx";

import Login from "./pages/auth/Login.jsx";
import Onboarding from "./pages/auth/Onboarding.jsx";

import OwnerPage from "./pages/owner/mypage/OwnerPage.jsx";
import ManageStore from "./pages/owner/mypage/ManageStore.jsx";
import OwnerCalendar from "./pages/owner/calendar/OwnerCalendar.jsx";
import EmployeePage from "./pages/employee/mypage/EmployeePage.jsx";
import AlarmHome from "./pages/owner/alarm/AlarmHome.jsx";
import AlarmCheck from "./pages/owner/alarm/AlarmCheck.jsx";
import CalAdd from "./pages/owner/calendarAdd/calAdd.jsx"
import ManageEmpPage from "./pages/owner/manage/ManageEmpPage.jsx";
import ManageSalary from "./pages/employee/manage/manageSalary.jsx";
import OwnerHome from "./pages/owner/OwnerHome.jsx";

function App() {
  const location = useLocation();

  // 헤더·푸터 제외할 페이지
  const hideLayoutPaths = [
    "/login",
    "/onboarding",
    "/calAdd",
    "/alarmhome",
    "/alarmcheck",
    "/"
  ];
  const hideLayout = hideLayoutPaths.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="w-full bg-[#F8FBFE] min-[393px]:w-[393px] mx-auto h-screen flex flex-col font-Pretendard">
      {!hideLayout && <Header />}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Login />} />

          {/* 로그인/온보딩 */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/owner" element={<OwnerHome />} />

          <Route path="/owner/mypage" element={<OwnerPage />} />
          <Route path="/owner/mypage/managestore" element={<ManageStore />} />
          <Route path="/employee/mypage" element={<EmployeePage />} />
          <Route
            path="/employee/mypage/managestore"
            element={<ManageStore />}
          />

          <Route path="/calAdd" element={<CalAdd />} />

          <Route path="/alarmhome" element={<AlarmHome />} />
          <Route path="/alarmcheck" element={<AlarmCheck />} />

          <Route path="/owner/manageemp" element={<ManageEmpPage />} />
          <Route path="/employee/managesalary" element={<ManageSalary />} />

          <Route path="/owner/calendar" element={<OwnerCalendar />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
