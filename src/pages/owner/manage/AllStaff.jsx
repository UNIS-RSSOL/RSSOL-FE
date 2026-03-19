import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import EmployeeInfo from "../../../components/manage/EmployeeInfo";
import Box from "../../../components/common/Box";
import { getAllWorkerSummary } from "../../../services/StoreService";
import TopBar from "../../../components/layout/header/TopBar";

function AllStaff() {
  const today = dayjs();
  const navigate = useNavigate();
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
    <div className="w-full scrollbar-hide">
      <TopBar title="직원관리" />
      <div className="flex flex-col w-full h-full items-center mt-5 pb-5 px-3 gap-5 overflow-y-auto">
        {employees?.map(
          (emp) =>
            emp.role !== "OWNER" && (
              <Box
                key={emp.userStoreId}
                disabled={false}
                onClick={() => {
                  console.log(emp.userStoreId);
                  navigate(`/owner/manage/employee/${emp.userStoreId}`);
                }}
              >
                <EmployeeInfo
                  tab={0}
                  profileImageUrl={emp.profileImageUrl}
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
