import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfoBox from "../../../components/mypage/InfoBox.jsx";
import UserIcon from "../../../assets/icons/UserIcon.jsx";
import MailIcon from "../../../assets/icons/MailIcon.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import SaveIcon from "../../../assets/icons/SaveIcon.jsx";
import TypeIcon from "../../../assets/icons/TypeIcon.jsx";
import MarkerIcon from "../../../assets/icons/MarkerIcon.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import FileEditIcon from "../../../assets/icons/FileEditIcon.jsx";
import character1 from "../../../assets/images/character1.png";
import Footer from "../../../components/layout/footer/Footer.jsx";
import HomeHeader from "../../../components/home/HomeHeader.jsx";
import HomeSidebar from "../../../components/home/HomeSidebar.jsx";
import BellIcon from "../../../assets/icons/BellIcon.jsx";
import {
  getOwnerProfile,
  getOwnerStore,
  updateOwnerProfile,
  updateOwnerStore,
  getOwnerStoreList,
  getActiveStore,
} from "../../../services/MypageService.js";

import { logout } from "../../../services/AuthService.js";

function OwnerPage() {
  const navigate = useNavigate();
  const [mydata, setMydata] = useState([]);
  const [storedata, setStoredata] = useState([]);
  const [profile, setProfile] = useState("");
  const [username, setUsername] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });

  const buildMydata = (name, email, businessNumber) => [
    {
      icon: <UserIcon className="size-[20px]" />,
      title: "내 이름",
      content: name,
    },
    {
      icon: <MailIcon className="size-[20px]" />,
      title: "내 이메일",
      content: email,
      msg: "올바른 형식으로 입력해 주세요.",
      check: checkEmail,
    },
    {
      icon: <CoinIcon className="size-[20px]" />,
      title: "사업자 등록 번호",
      content: businessNumber,
      msg: "최소 10자리부터 입력 가능합니다.",
      check: checkBusinum,
    },
  ];

  const buildStoredata = (storeCode, storeName, address, phone, storeStr) => [
    {
      icon: <SaveIcon className="size-[20px]" />,
      title: "매장 등록 코드",
      content: storeCode,
    },
    {
      icon: <TypeIcon className="size-[20px]" />,
      title: "매장 이름",
      content: storeName,
      msg: "최소 2자리부터 입력 가능합니다.",
      check: checkStoreName,
    },
    {
      icon: <MarkerIcon className="size-[20px]" />,
      title: "매장 주소",
      content: address,
    },
    {
      icon: <PhoneIcon className="size-[20px]" />,
      title: "매장 전화 번호",
      content: phone,
      msg: "최소 8자리부터 입력 가능합니다.",
      check: checkStorePhone,
    },
    {
      icon: <FileEditIcon className="size-[20px]" />,
      title: "내 매장 관리",
      content: storeStr,
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStore(active);

        const my = await getOwnerProfile();
        setProfile(my.profileImageUrl);
        setUsername(my.username);
        const store = await getOwnerStore();
        const storeList = await getOwnerStoreList();

        let storeStr = storeList.map((store) => store.name).join(", ");
        if (storeStr.length > 10) storeStr = storeStr.slice(0, 10) + "...";

        setMydata(
          buildMydata(my.username, my.email, my.businessRegistrationNumber),
        );
        setStoredata(
          buildStoredata(
            store.storeCode,
            store.name,
            store.address,
            store.phoneNumber,
            storeStr,
          ),
        );
      } catch (error) {
        console.error(error);
        // API 실패 시 목업 데이터
        setActiveStore({ storeId: 0, name: "매장 이름" });
        setUsername("홍길동");
        setMydata(
          buildMydata("홍길동", "alssol8888@gmail.com", "254-16-20568"),
        );
        setStoredata(
          buildStoredata(
            "QI-23-KCJS-9J2",
            "알바 솔로몬",
            "서대문구 대현동 21-3",
            "02-000-0000",
            "알바 솔로몬 1호점, 알바솔로...",
          ),
        );
      }
    })();
  }, []);

  //내정보수정
  const handleMyDataUpdate = async (updatedData) => {
    try {
      setMydata(updatedData);
      await updateOwnerProfile(
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
      await updateOwnerStore(
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
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      <HomeHeader
        storeName="마이페이지"
        onMenuClick={() => setSidebarOpen(true)}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/owner/notification/home")}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col divide-y-8 divide-[#e7eaf3]">
          {/* 프로필 + 이름 */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center size-[142px] bg-[#3370FF]/20 border-3 border-[#fdfffe] shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] overflow-hidden rounded-full mt-7">
              <img
                src={profile || character1}
                alt="profile"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[18px] font-[600] mt-2 mb-5">{username}</p>
          </div>

          {/* 내 정보 */}
          <InfoBox
            head="내 정보"
            myData={mydata}
            onDataUpdate={handleMyDataUpdate}
          />

          {/* 가게 정보 */}
          <InfoBox
            role="owner"
            head="가게 정보"
            myData={storedata}
            onDataUpdate={handleStoreDataUpdate}
          />

          {/* 로그아웃 */}
          <div className="flex items-center justify-center py-5">
            <p
              className="text-[12px]/[12px] font-[400] border-b border-black hover:text-[#3370FF] hover:border-[#3370FF] transition-colors duration-100 cursor-pointer"
              onClick={handleLogout}
            >
              로그아웃
            </p>
          </div>
        </div>
      </main>

      <Footer />

      <HomeSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeStore={activeStore}
        setActiveStore={setActiveStore}
        setSidebarOpen={setSidebarOpen}
        role="OWNER"
      />
    </div>
  );
}

export default OwnerPage;
