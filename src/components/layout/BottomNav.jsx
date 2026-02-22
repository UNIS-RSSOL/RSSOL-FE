import { useNavigate } from "react-router-dom";
import FooterMenu from "./footer/FooterMenu.jsx";
import HomeIcon from "../../assets/icons/HomeIcon.jsx";
import CalendarIcon from "../../assets/icons/CalendarIcon.jsx";
import EditIcon from "../../assets/icons/EditIcon.jsx";
import FileEditIcon from "../../assets/icons/FileEditIcon.jsx";

const ACTIVE_COLOR = "#3370FF";

const ROUTES = {
  owner: {
    home: "/owner",
    calendar: "/owner/calendar",
    todo: null,
    schedule: "/owner/schedule/add",
  },
  employee: {
    home: "/employee",
    calendar: "/employee/calendar",
    todo: null,
    schedule: "/employee/schedule/modifying",
  },
};

function BottomNav({ role, activePage }) {
  const navigate = useNavigate();
  const routes = ROUTES[role];

  return (
    <nav className="w-full h-[60px] flex flex-row justify-around items-center shrink-0 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)] bg-white">
      <FooterMenu
        MenuIcon={
          <HomeIcon
            filled={activePage === "home"}
            fillColor={ACTIVE_COLOR}
          />
        }
        title="홈"
        onClick={() => navigate(routes.home)}
      />
      <FooterMenu
        MenuIcon={
          <CalendarIcon
            filled={activePage === "calendar"}
            fillColor={ACTIVE_COLOR}
          />
        }
        title="캘린더"
        onClick={() => navigate(routes.calendar)}
      />
      <FooterMenu
        MenuIcon={<EditIcon />}
        title="할 일"
        onClick={() => {}}
      />
      <FooterMenu
        MenuIcon={<FileEditIcon />}
        title="근무표 제출"
        onClick={() => navigate(routes.schedule)}
      />
    </nav>
  );
}

export default BottomNav;
