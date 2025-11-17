import { useEffect, useState } from "react";
import CoinIcon from "../../../assets/icons/CoinIcon.jsx";
import PhoneIcon from "../../../assets/icons/PhoneIcon.jsx";
import DollarIcon from "../../../assets/icons/DollarIcon.jsx";
import CopyIcon from "../../../assets/icons/CopyIcon.jsx";
import Toast from "../../../components/common/Toast.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import LeftOutlined from "@ant-design/icons/es/icons/LeftOutlined";
import RightOutlined from "@ant-design/icons/es/icons/RightOutlined";
import { Divider } from "antd";
import CheckOutlined from "@ant-design/icons/es/icons/CheckOutlined";

const ManageSalary = () => {
  const [openToast, setOpenToast] = useState(false);
  const [tab, setTab] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [month2, setMonth2] = useState(new Date().getMonth() + 1);
  const today = new Date();
  const start = month.toString().padStart(2, "0") + ".01";
  const end =
    month.toString().padStart(2, "0") +
    "." +
    new Date(today.getFullYear(), month, 0)
      .getDate()
      .toString()
      .padStart(2, "0");

  const Box = ({ disabled, children }) => {
    const [isSelected, setIsSelected] = useState(false);

    return (
      <div
        className={`flex flex-col w-[360px] p-[18px] rounded-[20px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.20)] items-center ${isSelected ? "bg-[#68E194]/[0.2] border-[1px] border-[#68E194] cursor-pointer" : "bg-[#FDFFFE]"}`}
        onClick={disabled ? () => {} : () => setIsSelected(!isSelected)}
      >
        {children}
      </div>
    );
  };

  const SalaryInfo = ({ title, content }) => {
    return (
      <div className="flex justify-between">
        <p className="text-[14px] font-[500]">{title}</p>
        <p className="text-[14px] font-[500]">{content}원</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full items-center mt-5">
      <Box disabled={true}>
        <div className="flex items-center justify-center">
          <LeftOutlined
            className="cursor-pointer"
            onClick={() => setMonth((prev) => Math.max(1, prev - 1))}
          />
          <p className="text-[16px] font-[500] px-5">
            {today.getFullYear()}년 {month}월
          </p>
          <RightOutlined
            className="cursor-pointer"
            onClick={() => setMonth((prev) => Math.min(12, prev + 1))}
          />
        </div>
        <p className="text-[10px] font-[400] text-[#87888c]">
          {start}-{end}
        </p>
        <Divider className="h-[0.5px] bg-[#87888c]" style={{ margin: "1px" }} />
        <div className="flex flex-col w-full px-2 py-4 space-y-3">
          <SalaryInfo title="급여" content="17,217,610" />
          <SalaryInfo title="주휴수당" content="479,320" />
          <SalaryInfo title="연장근로(n시간)" content="479,320" />
          <SalaryInfo title="야간근로(n시간)" content="479,320" />
        </div>
        <Divider className="h-[0.5px] bg-[#87888c]" style={{ margin: "1px" }} />
        <div className="flex justify-between w-full px-2 pt-3">
          <p className="text-[20px] font-[400]">총 급여(=)</p>
          <p className="text-[20px] font-[400]">17,750,930원</p>
        </div>
      </Box>
      <div className="w-full h-[8px] bg-[#e7eaf3] my-5" />
      <Box disabled={true}>
        <div className="flex items-center justify-center">
          <LeftOutlined
            className="cursor-pointer"
            onClick={() => setMonth2((prev) => Math.max(1, prev - 1))}
          />
          <p className="text-[16px] font-[500] px-5">{month2}월 근태 확인</p>
          <RightOutlined
            className="cursor-pointer"
            onClick={() => setMonth2((prev) => Math.min(12, prev + 1))}
          />
        </div>
        <div className="flex flex-row mt-4 justify-evenly items-center gap-7">
          <div className="size-[88px] rounded-full border-[3px] border-white bg-[#68E194] shadow-[0_2px_4px_0_rgba(0,0,0,0.25)]"></div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">출근</p>
              <p className="text-[20px] font-[600]">17회</p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">지각</p>
              <p className="text-[20px] font-[600]">17회</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">결근</p>
              <p className="text-[20px] font-[600]">1회</p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">연장</p>
              <p className="text-[20px] font-[600]">17시간</p>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

export default ManageSalary;
