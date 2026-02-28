import RoundTag from "../common/RoundTag.jsx";
import CoinIcon from "../../assets/icons/CoinIcon.jsx";
import PhoneIcon from "../../assets/icons/PhoneIcon.jsx";
import DollarIcon from "../../assets/icons/DollarIcon.jsx";
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined";
import { useState } from "react";

function EmployeeInfo({
  tab,
  username,
  role,
  lateCount,
  absenceCount,
  monthlypay,
  tel,
  bankName,
  accountNumber,
  onClick,
}) {
  const [checked, setChecked] = useState(false);

  const handleClick = () => {
    setChecked(!checked);
    onClick();
  };

  return (
    <div className="flex flex-row w-full items-center">
      <div className="flex-shrink-0 w-[70px] h-[70px] bg-[#68E194] rounded-full border-[3px] border-white shadow-[0_2px_4px_0_RGBA(0,0,0,0.25)] mr-[16px]" />
      <div className="flex flex-col w-full gap-1">
        <div
          className={`flex-1 flex flex-row items-center justify-between ${tab === 0 && "mb-2"}`}
        >
          <div className="flex flex-row items-center min-w-0">
            <p className="text-[16px] font-[600] truncate mr-2">{username}</p>
            {tab === 0 && (
              <RoundTag className="!px-3 !py-[1px] !text-[12px] !font-[400]">
                {role === "STAFF" ? "알바" : "사장"}
              </RoundTag>
            )}
          </div>
          {tab === 0 && (
            <div className="flex-shrink-0 flex flex-row items-center gap-2">
              <p className="text-[12px] font-[400] text-[#26272A] whitespace-nowrap">
                지각 {lateCount}회
              </p>
              <p className="text-[12px] font-[400] text-[#26272A] whitespace-nowrap">
                결근 {absenceCount}회
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-row items-center">
          <CoinIcon className="size-[18px]" />
          <p className="text-[14px] font-[500] pl-3">{monthlypay}원</p>
        </div>
        {tab === 0 && (
          <div className="flex flex-row items-center">
            <PhoneIcon className="size-[18px]" />
            <p className="text-[14px] font-[500] pl-3">{tel}</p>
          </div>
        )}
        <div className="flex flex-row items-center">
          <DollarIcon />
          <p className="text-[14px] font-[500] pl-3">
            {bankName} {accountNumber}
          </p>
        </div>
      </div>
      {tab === 1 && (
        <div className="flex flex-col items-center justify-center gap-2">
          <div
            className={`flex size-[30px] rounded-full border-[1px] ${checked ? "border-[#32d1aa]" : "border-[#606060]"} cursor-pointer items-center justify-center`}
          >
            {checked && (
              <CheckOutlined style={{ fontWeight: "bold", fontSize: "20px" }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeInfo;
