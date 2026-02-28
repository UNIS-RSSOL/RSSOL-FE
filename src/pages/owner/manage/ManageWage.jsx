import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Divider } from "antd";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon.jsx";
import Box from "../../../components/common/Box.jsx";
import EmployeeInfo from "../../../components/manage/EmployeeInfo.jsx";
import { getAllWorkerSummary } from "../../../services/StoreService";
import { getTotalWage } from "../../../services/PayrollService.js";

function ManageWage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(1);
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [employees, setEmployees] = useState();
  const [wage, setWage] = useState();
  const start = currentDate.startOf("month");
  const end = currentDate.endOf("month");

  useEffect(() => {
    (async () => {
      const response = await getAllWorkerSummary(
        currentDate.format("YYYY"),
        currentDate.format("M"),
      );
      setEmployees(response.staffList);
      const wages = await getTotalWage(
        currentDate.format("YYYY"),
        currentDate.format("M"),
      );
      setWage(wages);
    })();
  }, [currentDate]);

  return (
    <div className="w-full">
      <div className="flex w-full bg-[#FDFFFE]">
        <div
          className="w-1/2 relative"
          onClick={() => {
            setTab(0);
            navigate("/owner/manage/employee");
          }}
        >
          <div
            className={`text-[18px] font-[500] cursor-pointer ${tab === 0 ? "text-black" : "text-[#87888C]"}`}
          >
            <div className="w-[80%] mx-auto font-[500] text-[18px]">
              전체 직원
              {tab === 0 && (
                <div className="w-full h-[3px] bg-[#6694FF] rounded-full"></div>
              )}
            </div>
          </div>
        </div>
        <div
          className="w-1/2 relative"
          onClick={() => {
            setTab(1);
            navigate("/owner/manage/wage");
          }}
        >
          <div
            className={`text-[18px] font-[500] cursor-pointer ${tab === 1 ? "text-black" : "text-[#87888C]"}`}
          >
            <div className="w-[80%] mx-auto font-[500] text-[18px]">
              급여 관리
              {tab === 1 && (
                <div className="w-full h-[3px] bg-[#6694FF] rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
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
                {wage?.totalRegularPay || 0}원
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-[14px] font-[500]">주휴수당(+)</p>
              <p className="text-[14px] font-[500]">
                {wage?.totalOvertimePay +
                  wage?.totalNightPay +
                  wage?.totalHolidayPay +
                  wage?.totalWeeklyHolidayPay || 0}
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
            <p className="text-[20px] font-[400]">{wage?.totalPay || 0}원</p>
          </div>
        </Box>
        <div className="w-full h-[8px] bg-[#e7eaf3] my-5" />
        <Box className="flex flex-col" disabled={true}>
          <p className="text-[16px] font-[500] mb-5">
            {currentDate.format("M")}월 급여 지급 리스트
          </p>
          <div className="flex flex-col w-full gap-5">
            {employees?.map(
              (emp) =>
                emp.role !== "OWNER" && (
                  <EmployeeInfo
                    tab={1}
                    key={emp.userStoreId}
                    username={emp.username}
                    monthlypay={emp.monthlyPay || 0}
                    bankName={emp.bankName}
                    accountNumber={emp.accountNumber}
                  />
                ),
            )}
          </div>
        </Box>
      </div>
    </div>
  );
}

export default ManageWage;
