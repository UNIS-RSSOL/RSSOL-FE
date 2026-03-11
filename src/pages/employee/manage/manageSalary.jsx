import { useState, useEffect } from "react";
import Box from "../../../components/common/Box.jsx";
import dayjs from "dayjs";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon.jsx";
import { Divider } from "antd";
import { getMyWage } from "../../../services/PayrollService.js";
import { getActiveStore } from "../../../services/MypageService.js";

const ManageSalary = () => {
  const [wage, setWage] = useState();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const start = currentDate.startOf("month");
  const end = currentDate.endOf("month");

  useEffect(() => {
    (async () => {
      const res = await getMyWage(
        currentDate.format("YYYY"),
        currentDate.format("M"),
      );
      console.log(res);
      const active = await getActiveStore();
      const w = res.filter((item) => item.storeId === active.storeId);
      setWage(w[0]);
      console.log(w[0]);
    })();
  }, [currentDate]);

  const SalaryInfo = ({ title, content }) => {
    return (
      <div className="flex justify-between">
        <p className="text-[14px] font-[500]">{title}</p>
        <p className="text-[14px] font-[500]">{content}원</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full items-center px-[16px] mt-5">
      <Box disabled={true} className="flex flex-col">
        <div className="flex items-center justify-center">
          <LeftArrowIcon
            className="cursor-pointer"
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
          />
          <p className="w-[140px] text-[16px] font-[500] px-5">
            {currentDate.format("YYYY")}년 {currentDate.format("M")}월
          </p>
          <RightArrowIcon
            className="cursor-pointer"
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
          />
        </div>
        <p className="text-[10px] font-[400] text-[#87888c]">
          {start.format("MM.DD")}-{end.format("MM.DD")}
        </p>
        <Divider className="h-[0.5px] bg-[#87888c]" style={{ margin: "1px" }} />
        <div className="flex flex-col w-full px-2 py-4 space-y-3">
          <SalaryInfo title="급여" content={wage?.basePay || 0} />
          <SalaryInfo title="주휴수당" content={wage?.holidayPay || 0} />
          <SalaryInfo
            title={`연장근로(${Math.floor(wage?.overtimeMinutes / 60) || 0}시간)`}
            content={wage?.overtimePay || 0}
          />
          <SalaryInfo
            title={`야간근로(${Math.floor(wage?.nightWorkMinutes / 60) || 0}시간)`}
            content={wage?.nightPay || 0}
          />
        </div>
        <Divider className="h-[0.5px] bg-[#87888c]" style={{ margin: "1px" }} />
        <div className="flex justify-between w-full px-2 pt-3">
          <p className="text-[20px] font-[400]">총 급여(=)</p>
          <p className="text-[20px] font-[400]">{wage?.totalPay || 0}원</p>
        </div>
      </Box>
      <div className="w-full h-[8px] bg-[#e7eaf3] my-5" />
      <Box className="flex flex-col" disabled={true}>
        <div className="flex items-center justify-center">
          <LeftArrowIcon
            className="cursor-pointer"
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
          />
          <p className="text-[16px] font-[500] px-5">
            {currentDate.format("M")}월 근태 확인
          </p>
          <RightArrowIcon
            className="cursor-pointer"
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
          />
        </div>
        <div className="flex flex-row mt-4 justify-evenly items-center gap-7">
          <div className="size-[88px] rounded-full border-[3px] border-white bg-[#68E194] shadow-[0_2px_4px_0_rgba(0,0,0,0.25)]"></div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">출근</p>
              <p className="text-[20px] font-[600]">
                {wage?.totalShiftCount || 0}회
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">지각</p>
              <p className="text-[20px] font-[600]">{wage?.lateCount || 0}회</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">결근</p>
              <p className="text-[20px] font-[600]">
                {wage?.absenceCount || 0}회
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-[14px] font-[400] mr-3">연장</p>
              <p className="text-[20px] font-[600]">
                {Math.floor(wage?.overtimeMinutes / 60) || 0}시간
              </p>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

export default ManageSalary;
