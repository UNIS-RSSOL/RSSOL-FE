import { Routes, Route } from "react-router-dom";
import "./App.css";
import "./index.css";
import Header from "./components/layout/header/Header.jsx";
import Footer from "./components/layout/footer/Footer.jsx";
import OwnerPage from "./pages/owner/mypage/OwnerPage.jsx";
import ManageStore from "./pages/owner/mypage/ManageStore.jsx";
import OwnerCalendar from "./pages/owner/calendar/OwnerCalendar.jsx";
import EmployeePage from "./pages/employee/mypage/EmployeePage.jsx";
import ManageEmpPage from "./pages/owner/manage/ManageEmpPage.jsx";
import ManageSalary from "./pages/employee/manage/manageSalary.jsx";

function App() {
  return (
    <div className="w-full bg-[#F8FBFE] min-[393px]:w-[393px] mx-auto h-screen flex flex-col font-Pretendard">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/owner/mypage" element={<OwnerPage />} />
          <Route path="/owner/mypage/managestore" element={<ManageStore />} />
          <Route path="/employee/mypage" element={<EmployeePage />} />
          <Route
            path="/employee/mypage/managestore"
            element={<ManageStore />}
          />

          <Route path="/owner/manageemp" element={<ManageEmpPage />} />
          <Route path="/employee/managesalary" element={<ManageSalary />} />

          <Route path="/owner/calendar" element={<OwnerCalendar />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
