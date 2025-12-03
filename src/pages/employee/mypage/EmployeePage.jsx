import { useState, useEffect } from "react";
import InfoBox from "../../../components/common/mypage/InfoBox.jsx";
import { MypageIcon } from "../../../assets/icons/MypageIcon.jsx";
import MsgIcon from "../../../assets/icons/MsgIcon.jsx";
import { CoinIcon } from "../../../assets/icons/CoinIcon.jsx";
import StoreIcon from "../../../assets/icons/StoreIcon.jsx";
import NoteIcon from "../../../assets/icons/NoteIcon.jsx";
import character from "../../../assets/images/EmpBtn.png";
import {
  fetchMydata,
  fetchStoreList,
  updateMydata,
} from "../../../services/employee/MyPageService.js";
import { logout } from "../../../services/authService.js";

function EmployeePage() {
  const [mydata, setMydata] = useState([]);
  const [profile, setProfile] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const my = await fetchMydata();
        setProfile(my.profileImageUrl);

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
            icon: <StoreIcon className="size-[20px]" filled={false} />,
            title: "등록 매장",
            content: my.currentStore.name,
          },
          {
            icon: <CoinIcon classNAme="size-[20px]" />,
            title: "은행 계좌번호",
            id: my.bankAccount.bankId,
            content: my.bankAccount.accountNumber,
            msg: "최소 10자리부터 입력 가능합니다.",
            check: checkBank,
          },
          {
            icon: <MsgIcon classNAme="size-[20px]" />,
            title: "내 이메일",
            content: my.email,
            msg: "최소 10자리부터 입력 가능합니다.",
            check: checkEmail,
          },
          {
            icon: <NoteIcon className="size-[20px]" />,
            title: "내 매장 관리",
            content: storeStr,
          },
        ];

        setMydata(initialMydata);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  //내정보수정
  const handleMyDataUpdate = async (updatedData) => {
    setMydata(updatedData);
    await updateMydata(
      updatedData[0].content,
      updatedData[3].content,
      updatedData[2].id,
      updatedData[2].content,
    );
    console.log(updatedData);
  };

  //이메일 체크
  const checkEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
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
    <div className="flex flex-col divide-y-8 divide-[#e7eaf3]">
      <div className="flex items-center justify-center">
        {profile === "" ? (
          <img src={character} alt="profile" className="size-[150px] my-5" />
        ) : (
          <div className="flex items-center justify-center size-[130px] bg-[#68e194] border-3 border-[#fdfffe] shadow-[0_4px_8px_0_rgba(0,0,0,0.2)] overflow-hidden rounded-full my-7">
            <img src={profile} alt="profile" />
          </div>
        )}
      </div>
      <InfoBox
        role="employee"
        head="내 정보"
        myData={mydata}
        onDataUpdate={handleMyDataUpdate}
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

export default EmployeePage;
