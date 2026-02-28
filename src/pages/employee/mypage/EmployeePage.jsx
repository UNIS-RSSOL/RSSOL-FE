import { useState, useEffect } from "react";
import InfoBox from "../../../components/mypage/InfoBox.jsx";
import UserIcon from "../../../assets/icons/UserIcon.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import FileEditIcon from "../../../assets/icons/FileEditIcon.jsx";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import StoreIcon from "../../../assets/icons/StoreIcon.jsx";
import character2 from "../../../assets/images/character2.png";
import Footer from "../../../components/layout/footer/Footer.jsx";
import {
  getStaffProfile,
  getStaffStoreList,
  updateStaffProfile,
} from "../../../services/MypageService.js";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../services/AuthService.js";

function EmployeePage() {
  const navigate = useNavigate();
  const [mydata, setMydata] = useState([]);
  const [profile, setProfile] = useState("");
  const [username, setUsername] = useState("");

  const buildMydata = (name, storeName, bankId, accountNumber, phone, storeStr) => [
    {
      icon: <UserIcon className="size-[20px]" />,
      title: "내 이름",
      content: name,
    },
    {
      icon: <StoreIcon className="size-[20px]" filled={false} />,
      title: "등록 매장",
      content: storeName,
    },
    {
      icon: <CoinIcon className="size-[20px]" />,
      title: "은행 계좌번호",
      id: bankId,
      content: accountNumber,
      msg: "최소 10자리부터 입력 가능합니다.",
      check: checkBank,
    },
    {
      icon: <PhoneIcon className="size-[20px]" />,
      title: "내 전화 번호",
      content: phone,
      msg: "올바른 형식으로 입력해 주세요.",
      check: checkPhone,
    },
    {
      icon: <FileEditIcon className="size-[20px]" />,
      title: "등록 매장 관리",
      content: storeStr,
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        const my = await getStaffProfile();
        setProfile(my.profileImageUrl);
        setUsername(my.username);

        const storeList = await getStaffStoreList();
        let storeStr = storeList.map((store) => store.name).join(", ");
        if (storeStr.length > 10) storeStr = storeStr.slice(0, 10) + "...";

        setMydata(buildMydata(
          my.username,
          my.currentStore.name,
          my.bankAccount.bankId,
          my.bankAccount.accountNumber,
          my.phoneNumber || "",
          storeStr,
        ));
      } catch (error) {
        console.error(error);
        // API 실패 시 목업 데이터
        setUsername("홍길동");
        setMydata(buildMydata(
          "홍길동",
          "알바 솔로몬 1호점",
          7,
          "333-3333-3333-33",
          "010-000-0000",
          "알바 솔로몬 1호점, 알바솔로...",
        ));
      }
    })();
  }, []);

  //내정보수정
  const handleMyDataUpdate = async (updatedData) => {
    setMydata(updatedData);
    await updateStaffProfile(
      updatedData[0].content,
      updatedData[3].content,
      updatedData[2].id,
      updatedData[2].content,
    );
  };

  //전화번호 체크
  const checkPhone = (phone) => {
    return phone.length >= 10;
  };

  //은행계좌번호 체크
  const checkBank = (bank) => {
    return bank.length > 10;
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

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      {/* 마이페이지 헤더 */}
      <div className="w-full h-[60px] flex items-center justify-center shrink-0 shadow-[0_2px_7px_0_rgba(0,0,0,0.1)] bg-white">
        <p className="text-[18px] font-[600]">마이페이지</p>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col divide-y-8 divide-[#e7eaf3]">
          {/* 프로필 + 이름 */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center justify-center size-[142px] bg-[#3370FF]/20 border-3 border-[#fdfffe] shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] overflow-hidden rounded-full mt-7">
              <img
                src={profile || character2}
                alt="profile"
                className="size-[100px] object-contain"
              />
            </div>
            <p className="text-[18px] font-[600] mt-2 mb-5">{username}</p>
          </div>

          {/* 내 정보 */}
          <InfoBox
            role="employee"
            head="내 정보"
            myData={mydata}
            onDataUpdate={handleMyDataUpdate}
          />

          {/* 로그아웃 */}
          <div className="flex items-center justify-center py-5">
            <p
              className="text-[12px]/[12px] font-[400] border-b border-black hover:text-[#68e194] hover:border-[#68e194] transition-colors duration-100 cursor-pointer"
              onClick={handleLogout}
            >
              로그아웃
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EmployeePage;
