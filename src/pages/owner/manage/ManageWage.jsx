import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Divider } from "antd";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon.jsx";
import Box from "../../../components/common/Box.jsx";
import EmployeeInfo from "../../../components/manage/EmployeeInfo.jsx";
import { getAllWorkerSummary } from "../../../services/StoreService";
import {
  getTotalWage,
  checkPayroll,
} from "../../../services/PayrollService.js";

function ManageWage() {
  const [wage, setWage] = useState();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [isPaid, setIsPaid] = useState([]);
  const start = currentDate.startOf("month");
  const end = currentDate.endOf("month");

  useEffect(() => {
    (async () => {
      const wages = await getTotalWage(
        currentDate.format("YYYY"),
        currentDate.format("M"),
      );
      setWage(wages);
      const arr = [];
      wages.employees.map((emp) => {
        arr.push(emp.paid);
      });
      setIsPaid(arr);
      console.log(arr);
      console.log(wages);
    })();
  }, [currentDate]);

  const handleCheck = async (userStoreId, paid) => {
    try {
      await checkPayroll(
        userStoreId,
        currentDate.format("YYYY"),
        currentDate.format("M"),
        paid,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "";
  };

  return (
    <div className="w-full px-3">
      <div className="flex flex-col w-full items-center mt-5">
        <Box className="flex flex-col" disabled={true}>
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
            {start.format("MM.DD")} - {end.format("MM-DD")}
          </p>
          <Divider
            className="h-[0.5px] bg-[#87888c]"
            style={{ margin: "1px" }}
          />
          <div className="flex flex-col w-full px-2 py-4 space-y-3">
            <div className="flex justify-between">
              <p className="text-[14px] font-[500]">누적 급여</p>
              <p className="text-[14px] font-[500]">
                {formatCurrency(wage?.totalRegularPay || 0)}원
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[14px] font-[500]">주휴수당(+)</p>
              <p className="text-[14px] font-[500]">
                {formatCurrency(
                  wage?.totalOvertimePay +
                    wage?.totalNightPay +
                    wage?.totalHolidayPay +
                    wage?.totalWeeklyHolidayPay || 0,
                )}
                원
              </p>
            </div>
          </div>
          <Divider
            className="h-[0.5px] bg-[#87888c]"
            style={{ margin: "1px" }}
          />
          <div className="flex justify-between w-full px-2 pt-3">
            <p className="text-[20px] font-[400]">총 급여(=)</p>
            <p className="text-[20px] font-[400]">
              {formatCurrency(wage?.totalPay || 0)}원
            </p>
          </div>
        </Box>
        <div className="w-full h-[8px] bg-[#e7eaf3] my-5" />
        <Box className="flex flex-col mb-5" disabled={true}>
          <p className="text-[16px] font-[500] mb-5">
            {currentDate.format("M")}월 급여 지급 리스트
          </p>
          <div className="flex flex-col w-full gap-5">
            {wage?.employees?.map((emp, index) => (
              <EmployeeInfo
                tab={1}
                key={emp.userStoreId}
                profileImageUrl={emp.profileImageUrl}
                username={emp.username}
                monthlypay={formatCurrency(emp.totalPay || 0)}
                // bankName={emp.bankName}
                // accountNumber={emp.accountNumber}
                check={isPaid[index]}
                onCheck={() => {
                  handleCheck(emp.userStoreId, !isPaid[index]);
                  setIsPaid((prev) => {
                    const newPaid = [...prev];
                    newPaid[index] = !isPaid[index];
                    return newPaid;
                  });
                }}
              />
            ))}
          </div>
        </Box>
      </div>
    </div>
  );
}

export default ManageWage;
