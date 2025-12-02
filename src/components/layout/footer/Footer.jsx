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
import { fetchActiveStore } from "../../../services/owner/MyPageService.js";

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMenu, setSelectedMenu] = useState("홈");
  const [role, setRole] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchActiveStore();
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
    if (path === `/${role}/mypage` || path === `/${role}/mypage/managestore`) {
      setSelectedMenu("마이페이지");
    } else if (path.includes(`/${role}/calendar`)) {
      setSelectedMenu("캘린더");
    } else if (path.includes(`/${role}/manage`)) {
      setSelectedMenu("직원관리");
    } else if (path.includes(`/${role}`)) {
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
          MenuIcon={<SelectedHomeIcon />}
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
          MenuIcon={<SelectedCalIcon />}
          title="캘린더"
          onClick={() => {
            handleMenuClick("캘린더");
            navigate(`/${role}/calendar`);
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<CalIcon />}
          title="캘린더"
          onClick={() => {
            handleMenuClick("캘린더");
            navigate(`/${role}/calendar`);
          }}
        />
      )}
      {selectedMenu === "직원관리" ? (
        <FooterMenu
          MenuIcon={<SelectedEditIcon />}
          title="직원관리"
          onClick={() => {
            handleMenuClick("직원관리");
            navigate(`/${role}/manage`);
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<EditIcon />}
          title="직원관리"
          onClick={() => {
            handleMenuClick("직원관리");
            navigate(`/${role}/manage`);
          }}
        />
      )}
      {selectedMenu === "마이페이지" ? (
        <FooterMenu
          MenuIcon={<SelectedMypageIcon />}
          title="마이페이지"
          onClick={() => {
            handleMenuClick("마이페이지");
            navigate(`/${role}/mypage`);
          }}
        />
      ) : (
        <FooterMenu
          MenuIcon={<MypageIcon />}
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
