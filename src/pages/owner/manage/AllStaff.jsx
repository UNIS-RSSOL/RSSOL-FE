import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import EmployeeInfo from "../../../components/manage/EmployeeInfo";
import Box from "../../../components/common/Box";
import { getAllWorkerSummary } from "../../../services/StoreService";

function AllStaff() {
  const today = dayjs();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [employees, setEmployees] = useState();

  useEffect(() => {
    (async () => {
      const response = await getAllWorkerSummary(
        today.format("YYYY"),
        today.format("M"),
      );
      setEmployees(response.staffList);
      console.log(response);
    })();
  }, []);

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
      <div className="flex flex-col w-full h-full items-center mt-5 gap-5 ">
        {employees?.map(
          (emp) =>
            emp.role !== "OWNER" && (
              <Box
                key={emp.userStoreId}
                disabled={false}
                // isSelected={checked === emp.userStoreId}
                // onClick={() => setChecked(emp.userStoreId)}
                onClick={() =>
                  navigate(`/owner/manage/employee/${emp.userStoreId}`)
                }
              >
                <EmployeeInfo
                  tab={0}
                  username={emp.username}
                  role={emp.role}
                  lateCount={emp.lateCount}
                  absenceCount={emp.absenceCount}
                  monthlypay={emp.monthlypay}
                  tel={emp.tel}
                  bankName={emp.bankName}
                  accountNumber={emp.accountNumber}
                />
              </Box>
            ),
        )}
      </div>
    </div>
  );
}

export default AllStaff;
