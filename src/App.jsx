import { Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <div className="w-full bg-[#F8FBFE] min-[393px]:w-[393px] mx-auto h-screen flex flex-col font-Pretendard">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/ownerpage" element={<OwnerPage />} />
          <Route path="/ownerpage/managestore" element={<ManageStore />} />
          <Route path="/employeepage" element={<EmployeePage />} />
          <Route path="/employeepage/managestore" element={<ManageStore />} />
          <Route path="/ownercalendar" element={<OwnerCalendar />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
