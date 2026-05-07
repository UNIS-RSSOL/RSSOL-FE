import { useNavigate, useLocation } from "react-router-dom";
import FooterMenu from "./FooterMenu.jsx";
import HomeIcon from "../../../assets/icons/HomeIcon.jsx";
import CalendarIcon from "../../../assets/icons/CalendarIcon.jsx";
import TodoSelectIcon from "../../../assets/icons/TodoSelectIcon.jsx";
import FileEditIcon from "../../../assets/icons/FileEditIcon.jsx";
import MyPageIcon from "../../../assets/icons/MyPageIcon.jsx";

const ACTIVE_COLOR = "#6694FF";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  // URL 경로에서 role 판별
  const getRoleFromPath = (path) => {
    if (path.includes("owner")) return "owner";
    if (path.includes("employee")) return "employee";
    return "owner"; // 기본값
  };

  const role = getRoleFromPath(location.pathname);
  const path = location.pathname;

  // 현재 선택된 메뉴 판별
  const isHome =
    path === `/${role}` || path === "/owner" || path === "/employee";
  const isCalendar = path.includes("calendar");
  const isTodo = path.includes("todo");
  const isScheduleAdd = path === "/owner/schedule/add";
  const isScheduleModifying = path === "/employee/schedule/modifying";
  const isFourthMenuActive =
    role === "owner" ? isScheduleAdd : isScheduleModifying;
  const isMyPage = path.includes("mypage");

  const handleScheduleMenuClick = () => {
    if (role !== "owner") {
      navigate("/employee/schedule/modifying");
      return;
    }

    try {
      const isGenerationCompleted =
        localStorage.getItem("scheduleGenerationCompleted") === "true";
      const hasScheduleRequest =
        localStorage.getItem("hasScheduleRequest") === "true";

      if (isGenerationCompleted) {
        localStorage.removeItem("scheduleGenerationCompleted");
        localStorage.removeItem("hasScheduleRequest");
        navigate("/owner/schedule/add");
        return;
      }

      if (hasScheduleRequest) {
        navigate("/owner/schedule/list");
        return;
      }
    } catch (_) {
      // localStorage 접근 실패 등 예외 시 기본 경로로 이동
    }

    navigate("/owner/schedule/add");
  };

  return (
    <nav className="w-full h-[60px] flex flex-row justify-around items-center shrink-0 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)] bg-white">
      <FooterMenu
        MenuIcon={<HomeIcon filled={isHome} fillColor={ACTIVE_COLOR} />}
        onClick={() => navigate(`/${role}`)}
      />
      <FooterMenu
        MenuIcon={<CalendarIcon filled={isCalendar} fillColor={ACTIVE_COLOR} />}
        onClick={() => navigate(`/${role}/calendar`)}
      />
      <FooterMenu
        MenuIcon={
          <FileEditIcon filled={isFourthMenuActive} fillColor={ACTIVE_COLOR} />
        }
        onClick={handleScheduleMenuClick}
      />
      <FooterMenu
        MenuIcon={<TodoSelectIcon filled={isTodo} fillColor={ACTIVE_COLOR} />}
        onClick={() => {
          navigate(`/${role}/todo`);
        }}
      />
      <FooterMenu
        MenuIcon={<MyPageIcon filled={isMyPage} fillColor={ACTIVE_COLOR} />}
        onClick={() => navigate(`/${role}/mypage`)}
      />
    </nav>
  );
}

export default Footer;
