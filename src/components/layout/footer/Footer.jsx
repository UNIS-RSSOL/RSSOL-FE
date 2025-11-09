import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FooterMenu from "./FooterMenu.jsx";
import { HomeIcon, SelectedHomeIcon } from "../../../assets/icons/HomeIcon.jsx";
import { CalIcon, SelectedCalIcon } from "../../../assets/icons/CalIcon.jsx";
import { EditIcon, SelectedEditIcon } from "../../../assets/icons/EditIcon.jsx";
import {
  MypageIcon,
  SelectedMypageIcon,
} from "../../../assets/icons/MypageIcon.jsx";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("홈");

  useEffect(() => {
    const path = location.pathname;
    if (
      path === "/ownerpage" ||
      path === "/ownerpage/managestore" ||
      path === "/employeepage"
    ) {
      setSelectedMenu("마이페이지");
    } else if (path.includes("/ownercalendar")) {
      setSelectedMenu("캘린더");
    } else if (path.includes("/employee")) {
      setSelectedMenu("직원관리");
    } else {
      setSelectedMenu("홈");
    }
  }, [location.pathname]);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
  };

  return (
    <div className="w-full h-[60px] flex flex-row justify-between items-center p-5 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)]">
      {selectedMenu === "홈" ? (
        <FooterMenu
          MenuIcon={<SelectedHomeIcon />}
          title="홈"
          onClick={() => handleMenuClick("홈")}
        />
      ) : (
        <FooterMenu
          MenuIcon={<HomeIcon />}
          title="홈"
          onClick={() => handleMenuClick("홈")}
        />
      )}
      {selectedMenu === "캘린더" ? (
        <FooterMenu
          MenuIcon={<SelectedCalIcon />}
          title="캘린더"
          onClick={() => {
            handleMenuClick("캘린더");
            navigate("/ownercalendar");
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<CalIcon />}
          title="캘린더"
          onClick={() => {
            handleMenuClick("캘린더");
            navigate("/ownercalendar");
          }}
        />
      )}
      {selectedMenu === "직원관리" ? (
        <FooterMenu
          MenuIcon={<SelectedEditIcon />}
          title="직원관리"
          onClick={() => handleMenuClick("직원관리")}
        />
      ) : (
        <FooterMenu
          MenuIcon={<EditIcon />}
          title="직원관리"
          onClick={() => handleMenuClick("직원관리")}
        />
      )}
      {selectedMenu === "마이페이지" ? (
        <FooterMenu
          MenuIcon={<SelectedMypageIcon />}
          title="마이페이지"
          onClick={() => {
            handleMenuClick("마이페이지");
            navigate("/ownerpage");
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<MypageIcon />}
          title="마이페이지"
          onClick={() => {
            handleMenuClick("마이페이지");
            navigate("/ownerpage");
          }}
        />
      )}
    </div>
  );
}

export default Footer;
