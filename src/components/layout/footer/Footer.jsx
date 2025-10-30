import React from "react";
import FooterMenu from "./FooterMenu.jsx";
import { HomeIcon, SelectedHomeIcon } from "../../../assets/icons/HomeIcon.jsx";
import { CalIcon, SelectedCalIcon } from "../../../assets/icons/CalIcon.jsx";
import { EditIcon, SelectedEditIcon } from "../../../assets/icons/EditIcon.jsx";
import {
  MypageIcon,
  SelectedMypageIcon,
} from "../../../assets/icons/MypageIcon.jsx";

function Footer() {
  return (
    <div className="w-full h-[60px] flex flex-row justify-between items-center p-5 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)]">
      <FooterMenu MenuIcon={<HomeIcon />} title="홈" />
      <FooterMenu MenuIcon={<CalIcon />} title="캘린더" />
      <FooterMenu MenuIcon={<EditIcon />} title="직원관리" />
      <FooterMenu MenuIcon={<MypageIcon />} title="마이페이지" />
    </div>
  );
}

export default Footer;
