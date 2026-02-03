import { useState } from "react";
import CoinIcon from "../../../assets/newicons/CoinIcon.jsx";
import PhoneIcon from "../../../assets/newicons/PhoneIcon.jsx";
import RoundTag from "../../../components/RoundTag.jsx";
import DollarIcon from "../../../assets/newicons/DollarIcon.jsx";
import Box from "../../../components/Box.jsx";
import Toast from "../../../components/Toast.jsx";
import Button from "../../../components/Button.jsx";
import LeftArrowIcon from "../../../assets/newicons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/newicons/RightArrowIcon.jsx";
import { Divider } from "antd";
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined";

const ManageEmp = () => {
  const [openToast, setOpenToast] = useState(false);
  const [tab, setTab] = useState(0);

  const EmployeeInfo = () => {
    const [isChecked, setIsChecked] = useState(false);

    return (
      <div className="flex flex-row w-full items-center">
        <div className="flex-shrink-0 w-[70px] h-[70px] bg-[#68E194] rounded-full border-[3px] border-white shadow-[0_2px_4px_0_RGBA(0,0,0,0.25)] mr-[16px]" />
        <div className="flex flex-col w-full gap-1">
          <div
            className={`flex-1 flex flex-row items-center justify-between ${tab === 0 && "mb-2"}`}
          >
            <div className="flex flex-row items-center min-w-0">
              <p className="text-[16px] font-[600] truncate">김민솔</p>
              {tab === 0 && <RoundTag>매니저</RoundTag>}
            </div>
            {tab === 0 && (
              <div className="flex-shrink-0 flex flex-row items-center gap-2">
                <p className="text-[12px] font-[400] text-[#26272A] whitespace-nowrap">
                  지각 1회
                </p>
                <p className="text-[12px] font-[400] text-[#26272A] whitespace-nowrap">
                  결근 0회
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-row items-center">
            <CoinIcon className="size-[18px]" />
            <p className="text-[14px] font-[500] pl-3">600,000원</p>
          </div>
          {tab === 0 && (
            <div className="flex flex-row items-center">
              <PhoneIcon className="size-[18px]" />
              <p className="text-[14px] font-[500] pl-3">010-0000-0000</p>
            </div>
          )}
          <div className="flex flex-row items-center">
            <DollarIcon />
            <p className="text-[14px] font-[500] pl-3">농협 302000000000</p>
          </div>
        </div>
        {tab === 1 && (
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="flex size-[30px] rounded-full border-[1px] border-[#606060] cursor-pointer items-center justify-center"
              onClick={() => setIsChecked(!isChecked)}
            >
              {isChecked && (
                <CheckOutlined
                  style={{ fontWeight: "bold", fontSize: "20px" }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const EmployeeList = () => {
    return (
      <div className="flex w-full items-center justify-center">
        <div
          className="flex items-center justify-center w-[20px] h-[20px] rounded-full bg-[#32d1aa] shadow-[0_2px_4px_0px_rgba(0,0,0,0.15)] mr-3"
          onClick={() => setOpenToast(true)}
        >
          1
        </div>
        <p className="mr-3">알쏠 1호점</p>
        <p className="mr-3">김민솔</p>
        <RoundTag>매니저</RoundTag>
      </div>
    );
  };

  const TotalEmployee = () => {
    return (
      <div className="flex w-full justify-center mt-5">
        <Box disabled={false}>
          <EmployeeInfo />
        </Box>
        {openToast && (
          <Toast>
            <p className="text-[16px] font-[600]">직원 관리하기</p>
            <p className="text-[12px] font-[400] my-3">
              선택한 직원을 리스트에서 삭제할까요?
            </p>
            <EmployeeList />
            <Button
              className="w-[360px] h-[48px] text-[16px] font-[600]"
              onClick={() => setOpenToast(false)}
            >
              직원 삭제하기
            </Button>
          </Toast>
        )}
      </div>
    );
  };

  const ManageSalary = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const start = month.toString().padStart(2, "0") + ".01";
    const end =
      month.toString().padStart(2, "0") +
      "." +
      new Date(today.getFullYear(), month, 0)
        .getDate()
        .toString()
        .padStart(2, "0");

    return (
      <div className="flex flex-col w-full items-center mt-5">
        <Box disabled={true}>
          <div className="flex items-center justify-center">
            <LeftArrowIcon className="cursor-pointer" />
            <p className="text-[16px] font-[500] px-5">
              {today.getFullYear()}년 {month}월
            </p>
            <RightArrowIcon className="cursor-pointer" />
          </div>
          <p className="text-[10px] font-[400] text-[#87888c]">
            {start}-{end}
          </p>
          <Divider
            className="h-[0.5px] bg-[#87888c]"
            style={{ margin: "1px" }}
          />
          <div className="flex flex-col w-full px-2 py-4 space-y-3">
            <div className="flex justify-between">
              <p className="text-[14px] font-[500]">누적 급여</p>
              <p className="text-[14px] font-[500]">17,217,610원</p>
            </div>
            <div className="flex justify-between">
              <p className="text-[14px] font-[500]">주휴수당(+)</p>
              <p className="text-[14px] font-[500]">479,320원</p>
            </div>
          </div>
          <Divider
            className="h-[0.5px] bg-[#87888c]"
            style={{ margin: "1px" }}
          />
          <div className="flex justify-between w-full px-2 pt-3">
            <p className="text-[20px] font-[400]">총 급여(=)</p>
            <p className="text-[20px] font-[400]">17,750,930원</p>
          </div>
        </Box>
        <div className="w-full h-[8px] bg-[#e7eaf3] my-5" />
        <Box disabled={true}>
          <p className="text-[16px] font-[500] mb-5">
            {month}월 급여 지급 리스트
          </p>
          <div className="felx flex-col w-full">
            <EmployeeInfo />
          </div>
        </Box>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex w-full bg-[#FDFFFE]">
        <div className="w-1/2 relative" onClick={() => setTab(0)}>
          <div
            className={`text-[18px] font-[500] cursor-pointer ${tab === 0 ? "text-black" : "text-[#87888C]"}`}
          >
            <div className="w-[80%] mx-auto">
              전체 직원
              {tab === 0 && (
                <div className="w-full h-[3px] bg-[#32d1aa] rounded-full"></div>
              )}
            </div>
          </div>
        </div>
        <div className="w-1/2 relative" onClick={() => setTab(1)}>
          <div
            className={`text-[18px] font-[500] cursor-pointer ${tab === 1 ? "text-black" : "text-[#87888C]"}`}
          >
            <div className="w-[80%] mx-auto">
              급여 관리
              {tab === 1 && (
                <div className="w-full h-[3px] bg-[#32d1aa] rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
      {tab === 0 && <TotalEmployee />}
      {tab === 1 && <ManageSalary />}
    </div>
  );
};

export default ManageEmp;
