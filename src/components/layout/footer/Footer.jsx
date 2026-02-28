import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FooterMenu from "./FooterMenu.jsx";
import HomeIcon from "../../../assets/icons/HomeIcon.jsx";
import CalendarIcon from "../../../assets/icons/CalendarIcon.jsx";
import EditIcon from "../../../assets/icons/EditIcon.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import UserIcon from "../../../assets/icons/UserIcon.jsx";
import { getActiveStore } from "../../../services/MypageService.js";

const ACTIVE_COLOR = "#3370FF";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("홈");

  // URL 경로에서 role 판별 (즉시) + API로 보정
  const getRoleFromPath = (path) => {
    if (path.includes("owner")) return "owner";
    if (path.includes("employee")) return "employee";
    return null;
  };

  const [role, setRole] = useState(() => getRoleFromPath(location.pathname));

  useEffect(() => {
    // URL 변경 시 즉시 role 업데이트
    const pathRole = getRoleFromPath(location.pathname);
    if (pathRole) setRole(pathRole);
  }, [location.pathname]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getActiveStore();
        const r = response.position;
        if (r === "OWNER") setRole("owner");
        else setRole("employee");
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("calendar")) {
      setSelectedMenu("캘린더");
    } else if (path.includes("mypage")) {
      setSelectedMenu("마이페이지");
    } else if (path.includes("manage")) {
      setSelectedMenu("관리");
    } else {
      setSelectedMenu("홈");
    }
  }, [location.pathname]);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  const isHome = selectedMenu === "홈";
  const isCalendar = selectedMenu === "캘린더";
  const isManage = selectedMenu === "관리";
  const isMypage = selectedMenu === "마이페이지";

  return (
    <div className="w-full h-[60px] flex flex-row justify-around items-center shrink-0 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)] bg-white">
      <FooterMenu
        MenuIcon={<HomeIcon filled={isHome} fillColor={ACTIVE_COLOR} />}
        title="홈"
        onClick={() => {
          handleMenuClick("홈");
          navigate(`/${role}`);
        }}
      />
      <FooterMenu
        MenuIcon={<CalendarIcon filled={isCalendar} fillColor={ACTIVE_COLOR} />}
        title="캘린더"
        onClick={() => {
          handleMenuClick("캘린더");
          navigate(`/${role}/calendar`);
        }}
      />
      {role === "owner" ? (
        <FooterMenu
          MenuIcon={<EditIcon filled={isManage} fillColor={ACTIVE_COLOR} />}
          title="직원관리"
          onClick={() => {
            handleMenuClick("관리");
            navigate("/owner/manage");
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<CoinIcon filled={isManage} fillColor={ACTIVE_COLOR} />}
          title="급여관리"
          onClick={() => {
            handleMenuClick("관리");
            navigate("/employee/manage");
          }}
        />
      )}
      <FooterMenu
        MenuIcon={<UserIcon filled={isMypage} fillColor={ACTIVE_COLOR} />}
        title="마이페이지"
        onClick={() => {
          handleMenuClick("마이페이지");
          navigate(`/${role}/mypage`);
        }}
      />
    </div>
  );
}

export default Footer;
