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
import CalAdd from "./pages/owner/calendarAdd/calAdd.jsx"

function App() {
  const location = useLocation();

  // 헤더·푸터 제외할 페이지
    const hideLayoutPaths = ["/login", "/onboarding"];
    const hideLayout = hideLayoutPaths.some(path =>
      location.pathname.startsWith(path)
    );
  
  return (
    <div className="w-full bg-[#F8FBFE] min-[393px]:w-[393px] mx-auto h-screen flex flex-col font-Pretendard">
      {!hideLayout && <Header />}

      <main className="flex-1 overflow-y-auto">
        <Routes>
          {/* 개발용 기본 진입 → OwnerPage */}
          <Route path="/" element={<CalAdd />} />

          {/* 로그인/온보딩 */}
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* 사장님/직원 페이지 */}
          <Route path="/ownerpage" element={<OwnerPage />} />
          <Route path="/ownerpage/managestore" element={<ManageStore />} />
          <Route path="/ownercalendar" element={<OwnerCalendar />} />
          <Route path="/employeepage" element={<EmployeePage />} />
          <Route path="/employeepage/managestore" element={<ManageStore />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
