import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FooterMenu from "./FooterMenu.jsx";
import HomeIcon from "../../../assets/newicons/HomeIcon.jsx";
import CalendarIcon from "../../../assets/newicons/CalendarIcon.jsx";
import EditIcon from "../../../assets/newicons/EditIcon.jsx";
import CoinIcon from "../../../assets/newicons/CoinIcon.jsx";
import UserIcon from "../../../assets/newicons/UserIcon.jsx";
import { getActiveStore } from "../../../services/new/MypageService.js";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("홈");
  const [role, setRole] = useState(null);

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

  return (
    <div className="w-full h-[60px] flex flex-row justify-between items-center px-2 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)] bg-white">
      {selectedMenu === "홈" ? (
        <FooterMenu
          MenuIcon={<HomeIcon filled="true" />}
          title="홈"
          onClick={() => {
            handleMenuClick("홈");
            navigate(`/${role}`);
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<HomeIcon />}
          title="홈"
          onClick={() => {
            handleMenuClick("홈");
            navigate(`/${role}`);
          }}
        />
      )}
      {selectedMenu === "캘린더" ? (
        <FooterMenu
          MenuIcon={<CalendarIcon filled={true} />}
          title="캘린더"
          onClick={() => {
            handleMenuClick("캘린더");
            navigate(`/${role}/calendar`);
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<CalendarIcon />}
          title="캘린더"
          onClick={() => {
            handleMenuClick("캘린더");
            navigate(`/${role}/calendar`);
          }}
        />
      )}
      {role === "owner" ? (
        selectedMenu === "관리" ? (
          <FooterMenu
            MenuIcon={<EditIcon filled="true" />}
            title="직원관리"
            onClick={() => {
              handleMenuClick("관리");
              navigate("/owner/manage");
            }}
          />
        ) : (
          <FooterMenu
            MenuIcon={<EditIcon />}
            title="직원관리"
            onClick={() => {
              handleMenuClick("관리");
              navigate("/owner/manage");
            }}
          />
        )
      ) : selectedMenu === "관리" ? (
        <FooterMenu
          MenuIcon={<CoinIcon filled={true} />}
          title="급여관리"
          onClick={() => {
            handleMenuClick("관리");
            navigate("/employee/manage");
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<CoinIcon />}
          title="급여관리"
          onClick={() => {
            handleMenuClick("관리");
            navigate("/employee/manage");
          }}
        />
      )}
      {selectedMenu === "마이페이지" ? (
        <FooterMenu
          MenuIcon={<UserIcon filled={true} />}
          title="마이페이지"
          onClick={() => {
            handleMenuClick("마이페이지");
            navigate(`/${role}/mypage`);
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<UserIcon />}
          title="마이페이지"
          onClick={() => {
            handleMenuClick("마이페이지");
            navigate(`/${role}/mypage`);
          }}
        />
      )}
    </div>
  );
}

export default Footer;
