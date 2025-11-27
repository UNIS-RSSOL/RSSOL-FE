import React, { useEffect, useState } from "react";
import { MypageIcon } from "../../../assets/icons/MypageIcon.jsx";
import InfoBox from "../../../components/common/mypage/InfoBox.jsx";
import InfoItem from "../../../components/common/mypage/InfoItem.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import NoteIcon from "../../../assets/icons/NoteIcon.jsx";
import StoreIcon from "../../../assets/icons/StoreIcon.jsx";
import MsgIcon from "../../../assets/icons/MsgIcon.jsx";
import character1 from "../../../assets/images/character1.png";
import {
  fetchMydata,
  updateMydata,
} from "../../../services/employee/MyPageService.js";

function EmployeePage() {
  const [mydata, setMydata] = useState(null);
  const [storedata, setStoredata] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = fetchMydata();
        setMydata(data);
        const storedata = fetchStoredata();
        setStoredata(storedata);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleUpdateMydata = async () => {
    try {
      await updateMydata(
        mydata?.username,
        mydata?.email,
        mydata?.businessRegistrationNumber,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const checkEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]$/;
    return emailRegex.test(email);
  };

  return (
    <div className="w-full flex flex-col divide-y-8 divide-[#E7EAF3]">
      <div className="flex flex-col items-center">
        <div className="flex w-[130px] h-[130px] bg-[#68E194] rounded-full border-[3px] border-white mt-7 mb-3 shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] items-center justify-center overflow-hidden">
          {mydata?.profileImageUrl ? (
            <img src={mydata?.profileImageUrl} alt="profile" sizes="130px" />
          ) : (
            <img src={character1} alt="profile" sizes="50px" />
          )}
        </div>
        <p className="text-[20px] font-semibold mb-4">{mydata?.username}</p>
      </div>
      <InfoBox title="내 정보" update={handleUpdateMydata}>
        <InfoItem
          icon={<MypageIcon className="size-6 m-2" />}
          title="내 이름"
          content={mydata?.username}
        />
        <InfoItem
          icon={<StoreIcon className="size-6 m-2" />}
          title="등록 매장"
          content={mydata?.currentStore?.name}
        />
        <InfoItem
          icon={<CoinIcon className="size-6 m-2" />}
          title="은행 계좌번호"
          content={mydata?.bankAccount?.bankName}
          msg="*올바른 형식으로 입력해주세요."
        />
        <InfoItem
          icon={<MsgIcon className="size-6 m-2" />}
          title="내 이메일"
          content={mydata?.email}
          msg="*올바른 형식으로 입력해주세요."
          check={checkEmail}
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

export default EmployeePage;
