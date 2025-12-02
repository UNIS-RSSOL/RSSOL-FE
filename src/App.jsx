import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import Splash from "./pages/common/Splash.jsx";

import { refreshAccessToken } from "./services/kakaoLogin.js";
import api from "./services/api.js";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  console.log("📍 Current Path:", location.pathname);

  // 초기 인증 상태 체크 (루트 경로에서만 실행)
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // 루트 경로("/")가 아니면 체크하지 않음
      if (location.pathname !== "/") {
        return;
      }

      setIsCheckingAuth(true);

      try {
        // refreshToken 확인
        const refreshToken = localStorage.getItem("refreshToken");
        const accessToken = localStorage.getItem("accessToken");

        // refreshToken이 있으면 토큰 갱신 시도
        if (refreshToken) {
          try {
            console.log("refreshToken으로 accessToken 갱신 시도");
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
              console.log("토큰 갱신 성공");
            }
          } catch (refreshError) {
            console.log("토큰 갱신 실패:", refreshError);
            // refreshToken이 만료되었거나 유효하지 않으면 로그인 페이지로
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            navigate("/login", { replace: true });
            return;
          }
        }

        // accessToken이 없으면 로그인 페이지로
        const currentAccessToken = localStorage.getItem("accessToken");
        if (!currentAccessToken) {
          console.log("accessToken 없음 -> 로그인 페이지로");
          navigate("/login", { replace: true });
          return;
        }

        // 온보딩 완료 여부 확인 (활성 매장 정보 확인)
        try {
          const activeStoreRes = await api.get("/api/mypage/active-store");
          const activeStore = activeStoreRes.data;

          console.log("활성 매장 정보:", activeStore);

          // 활성 매장이 있으면 정보 등록 완료 -> 홈페이지로 이동
          if (activeStore && activeStore.storeId) {
            // 사용자 역할 확인을 위해 프로필 정보 조회 시도
            // owner 프로필을 먼저 시도
            try {
              await api.get("/api/mypage/owner/profile");
              console.log("사장님 프로필 확인 성공 -> /owner로 이동");
              navigate("/owner", { replace: true });
              return;
            } catch (ownerError) {
              // owner 프로필이 없으면 staff로 시도
              try {
                await api.get("/api/mypage/staff/profile");
                console.log("알바생 프로필 확인 성공 -> /employee로 이동");
                navigate("/employee", { replace: true });
                return;
              } catch (staffError) {
                // 둘 다 실패하면 정보 미등록으로 간주
                console.log("프로필 확인 실패 -> 온보딩으로 이동");
                navigate("/onboarding", { replace: true });
                return;
              }
            }
          } else {
            // 활성 매장이 없으면 정보 미등록 -> 온보딩으로 이동
            console.log("활성 매장 없음 -> 온보딩으로 이동");
            navigate("/onboarding", { replace: true });
            return;
          }
        } catch (storeError) {
          // 활성 매장 조회 실패 (404 등) -> 정보 미등록으로 간주
          console.log(
            "활성 매장 조회 실패 (정보 미등록) -> 온보딩으로 이동:",
            storeError.response?.status,
          );
          navigate("/onboarding", { replace: true });
          return;
        }
      } catch (err) {
        console.error("인증 체크 중 에러:", err);
        // 에러 발생 시 로그인 페이지로
        navigate("/login", { replace: true });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndRedirect();
  }, [location.pathname, navigate]);

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

  // 인증 체크 중일 때 스플래시 표시
  if (isCheckingAuth && location.pathname === "/") {
    return <Splash />;
  }

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

          <Route path="/owner/manage" element={<ManageEmpPage />} />
          <Route path="/employee/manage" element={<ManageSalary />} />

          <Route path="/owner/calendar" element={<OwnerCalendar />} />
          <Route path="/employee/calendar" element={<EmpCalendar />} />
        </Routes>
      </main>

      {!hideLayout && <Footer />}
    </div>
  );
}

export default App;
