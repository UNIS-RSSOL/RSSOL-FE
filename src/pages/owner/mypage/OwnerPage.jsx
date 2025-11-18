import React from "react";
import { MypageIcon } from "../../../assets/icons/MypageIcon.jsx";
import InfoBox from "../../../components/common/mypage/InfoBox.jsx";
import InfoItem from "../../../components/common/mypage/InfoItem.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";
import TypeIcon from "../../../assets/icons/TypeIcon.jsx";
import MapIcon from "../../../assets/icons/MapIcon.jsx";
import NoteIcon from "../../../assets/icons/NoteIcon.jsx";

function OwnerPage() {
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
          icon={<PhoneIcon className="size-6 m-2" />}
          title="내 전화 번호"
          content="010-0000-0000"
        />
        <InfoItem
          icon={<CoinIcon className="size-6 m-2" />}
          title="사업자 등록 번호"
          content="254-16-20568"
          msg="*최소 10자리부터 입력가능합니다."
          numRule={function (e) {
            return value.length >= 10;
          }}
        />
      </InfoBox>
      <InfoBox title="가게 정보">
        <InfoItem
          icon={<SaveIcon className="size-6 m-2" />}
          title="매장 등록 코드"
          content="QI-23-KCJS-9J2"
          hasCopy={true}
        />
        <InfoItem
          icon={<TypeIcon className="size-6 m-2" />}
          title="매장 이름"
          content="알바 솔로몬"
          msg="*최소 2자리부터 입력가능합니다."
        />
        <InfoItem
          icon={<MapIcon className="size-6 m-2" />}
          title="매장 주소"
          content="서대문구 대현동 21-3"
        />
        <InfoItem
          icon={<PhoneIcon className="size-6 m-2" />}
          title="매장 전화 번호"
          content="02-000-0000"
          msg="*최소 8자리부터 입력가능합니다."
        />
        <InfoItem
          icon={<NoteIcon className="size-6 m-2" />}
          title="내 매장 관리"
          content="알바 솔로몬 1호점"
          hasArrow={true}
          nav="/owner/mypage/managestore"
        />
      </InfoBox>
    </div>
  );
}

export default OwnerPage;
