import React from "react";
import { MypageIcon } from "../../../assets/icons/MypageIcon.jsx";
import InfoBox from "../../../components/common/mypage/InfoBox.jsx";
import InfoItem from "../../../components/common/mypage/InfoItem.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import NoteIcon from "../../../assets/icons/NoteIcon.jsx";
import StoreIcon from "../../../assets/icons/StoreIcon.jsx";

function EmployeePage() {
  return (
    <div className=" flex flex-col divide-y-8 divide-[#E7EAF3]">
      <div className="flex flex-col items-center">
        <div className="w-[130px] h-[130px] bg-[#68E194] rounded-full border-[3px] border-white mt-7 mb-3 shadow-[0_4px_8px_0_rgba(0,0,0,0.2)]"></div>
        <p className="text-[20px] font-semibold mb-4">홍길동</p>
      </div>
      <InfoBox title="내 정보">
        <InfoItem
          icon={<MypageIcon className="size-6 m-2" />}
          title="내 이름"
          content="홍길동"
        />
        <InfoItem
          icon={<StoreIcon className="size-6 m-2" />}
          title="등록 매장"
          content="알바 솔로몬 1호점"
        />
        <InfoItem
          icon={<CoinIcon className="size-6 m-2" />}
          title="은행 계좌번호"
          content="카카오뱅크 333-3333-3333-33"
        />
        <InfoItem
          icon={<PhoneIcon className="size-6 m-2" />}
          title="내 전화 번호"
          content="010-0000-0000"
        />
        <InfoItem
          icon={<NoteIcon className="size-6 m-2" />}
          title="등록 매장 관리"
          content="알바 솔로몬 1호점"
          hasArrow={true}
          nav="/employee/mypage/managestore"
        />
      </InfoBox>
    </div>
  );
}

export default EmployeePage;
