import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoBox from "../../../components/common/mypage/InfoBox.jsx";
import { MypageIcon } from "../../../assets/icons/MypageIcon.jsx";
import MsgIcon from "../../../assets/icons/MsgIcon.jsx";
import { CoinIcon } from "../../../assets/icons/CoinIcon.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";
import TypeIcon from "../../../assets/icons/TypeIcon.jsx";
import MapIcon from "../../../assets/icons/MapIcon.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import NoteIcon from "../../../assets/icons/NoteIcon.jsx";
import character from "../../../assets/images/OwnerBtn.png";

import {
  fetchMydata,
  fetchStoredata,
  updateMydata,
  updateStoredata,
  fetchStoreList,
} from "../../../services/owner/MyPageService.js";
import { logout } from "../../../services/authService.js";

function OwnerPage() {
  const navigate = useNavigate();
  const [mydata, setMydata] = useState([]);
  const [storedata, setStoredata] = useState([]);
  const [profile, setProfile] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const my = await fetchMydata();
        setProfile(my.profileImageUrl);
        const store = await fetchStoredata();
        const storeList = await fetchStoreList();

        let storeStr = storeList.map((store) => store.name).join(", ");
        if (storeStr.length > 10) storeStr = storeStr.slice(0, 10) + "...";
        const initialMydata = [
          {
            icon: <MypageIcon className="size-[20px]" />,
            title: "내 이름",
            content: my.username,
          },
          {
            icon: <MsgIcon className="size-[20px]" />,
            title: "내 이메일",
            content: my.email,
            msg: "올바른 형식으로 입력해 주세요.",
            check: checkEmail,
          },
          {
            icon: <CoinIcon classNAme="size-[20px]" />,
            title: "사업자 등록 번호",
            content: my.businessRegistrationNumber,
            msg: "최소 10자리부터 입력 가능합니다.",
            check: checkBusinum,
          },
        ];
        const initialStoredata = [
          {
            icon: <SaveIcon className="size-[20px]" />,
            title: "매장 등록 코드",
            content: store.storeCode,
          },
          {
            icon: <TypeIcon className="size-[20px]" />,
            title: "매장 이름",
            content: store.name,
            msg: "최소 2자리부터 입력 가능합니다.",
            check: checkStoreName,
          },
          {
            icon: <MapIcon className="size-[20px]" />,
            title: "매장 주소",
            content: store.address,
          },
          {
            icon: <PhoneIcon className="size-[20px]" />,
            title: "매장 전화 번호",
            content: store.phoneNumber,
            msg: "최소 8자리부터 입력 가능합니다.",
            check: checkStorePhone,
          },
          {
            icon: <NoteIcon className="size-[20px]" />,
            title: "내 매장 관리",
            content: storeStr,
          },
        ];
        setMydata(initialMydata);
        setStoredata(initialStoredata);
        console.log(initialMydata);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  //내정보수정
  const handleMyDataUpdate = async (updatedData) => {
    try {
      setMydata(updatedData);
      await updateMydata(
        updatedData[0].content,
        updatedData[1].content,
        updatedData[2].content,
      );
    } catch (error) {
      console.error(error);
    }
  };

  //가게정보 수정
  const handleStoreDataUpdate = async (updatedData) => {
    try {
      setStoredata(updatedData);
      await updateStoredata(
        updatedData[1].content,
        updatedData[2].content,
        updatedData[3].content,
      );
    } catch (error) {
      console.error(error);
    }
  };

  //로그아웃
  const handleLogout = async () => {
    try {
      await logout();
      alert("로그아웃 되었습니다.");
      navigate("/");
    } catch (error) {
      alert("로그아웃 실패:", error);
      navigate("/");
    }
  };

  //이메일 체크
  const checkEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  //사업자 등록 번호 체크
  const checkBusinum = (businum) => {
    return businum.length > 9;
  };

  //매장 이름 체크
  const checkStoreName = (storeName) => {
    return storeName.length > 1;
  };

  //매장 전화번호 체크
  const checkStorePhone = (storePhone) => {
    return storePhone.length > 7;
  };

  return (
    <div className="flex flex-col divide-y-8 divide-[#e7eaf3]">
      <div className="flex items-center justify-center">
        {!profile || profile === "" || profile === null ? (
          <img src={character} alt="profile" className="size-[150px] my-5" />
        ) : (
          <div className="flex items-center justify-center size-[130px] bg-[#68e194] border-3 border-[#fdfffe] shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] overflow-hidden rounded-full my-7">
            <img src={profile} alt="profile" />
          </div>
        )}
      </div>
      <InfoBox
        head="내 정보"
        myData={mydata}
        onDataUpdate={handleMyDataUpdate}
      />
      <InfoBox
        role="owner"
        head="가게 정보"
        myData={storedata}
        onDataUpdate={handleStoreDataUpdate}
      />
      <div className="flex items-center justify-center py-5">
        <p
          className="text-[12px]/[12px] font-[400] border-b border-black hover:text-[#68e194] hover:border-[#68e194] transition-colors duration-100 cursor-pointer"
          onClick={handleLogout}
        >
          로그아웃
        </p>
      </div>
    </div>
  );
}

export default OwnerPage;
