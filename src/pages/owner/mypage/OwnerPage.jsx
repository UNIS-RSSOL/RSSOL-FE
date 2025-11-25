import React, { useEffect, useState } from "react";
import { MypageIcon } from "../../../assets/icons/MypageIcon.jsx";
import InfoBox from "../../../components/common/mypage/InfoBox.jsx";
import InfoItem from "../../../components/common/mypage/InfoItem.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";
import TypeIcon from "../../../assets/icons/TypeIcon.jsx";
import MapIcon from "../../../assets/icons/MapIcon.jsx";
import NoteIcon from "../../../assets/icons/NoteIcon.jsx";
import MsgIcon from "../../../assets/icons/MsgIcon.jsx";
import character1 from "../../../assets/images/character1.png";
import {
  fetchMydata,
  fetchStoredata,
} from "../../../services/owner/MyPageService";

function OwnerPage() {
  const [mydata, setMydata] = useState(null);
  const [storedata, setStoredata] = useState(null);

  useEffect(() => {
    const data = fetchMydata();
    setMydata(data);
    const storedata = fetchStoredata();
    setStoredata(storedata);
  }, []);

  return (
    <div className="w-full flex flex-col divide-y-8 divide-[#E7EAF3]">
      <div className="flex flex-col items-center">
        <div className="flex w-[130px] h-[130px] bg-[#68E194] rounded-full border-[3px] border-white mt-7 mb-3 shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] items-center justify-center overflow-hidden">
          <img src={mydata?.profileImageUrl} alt="profile" sizes="130px" />
        </div>
        <p className="text-[20px] font-semibold mb-4">{mydata?.username}</p>
      </div>
      <InfoBox title="내 정보">
        <InfoItem
          icon={<MypageIcon className="size-6 m-2" />}
          title="내 이름"
          content={mydata?.username}
        />
        <InfoItem
          icon={<MsgIcon className="size-6 m-2" />}
          title="내 이메일"
          content={mydata?.email}
        />
        <InfoItem
          icon={<CoinIcon className="size-6 m-2" />}
          title="사업자 등록 번호"
          content={mydata?.businessRegistrationNumber}
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
          content={storedata?.storeCode}
          hasCopy={true}
        />
        <InfoItem
          icon={<TypeIcon className="size-6 m-2" />}
          title="매장 이름"
          content={storedata?.name}
          msg="*최소 2자리부터 입력가능합니다."
        />
        <InfoItem
          icon={<MapIcon className="size-6 m-2" />}
          title="매장 주소"
          content={storedata?.address}
        />
        <InfoItem
          icon={<PhoneIcon className="size-6 m-2" />}
          title="매장 전화 번호"
          content={storedata?.phoneNumber}
          msg="*최소 8자리부터 입력가능합니다."
        />
        <InfoItem
          icon={<NoteIcon className="size-6 m-2" />}
          title="내 매장 관리"
          content={storedata?.name}
          hasArrow={true}
          nav="/owner/mypage/managestore"
        />
      </InfoBox>
    </div>
  );
}

export default OwnerPage;
