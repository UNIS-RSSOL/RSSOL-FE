import { useState, useEffect } from "react";
import dayjs from "dayjs";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon";
import BackButton from "../../../components/common/BackButton";
import Button from "../../../components/common/Button";
import PencilIcon from "../../../assets/icons/PencilIcon";
import { getEmployeeAttendance } from "../../../services/ViewAttendanceService";
import { getEmployeeProfile } from "../../../services/ViewProfileService";

function EmployeeProfile({ userStoreId }) {
  const [page, setPage] = useState(1);
  const [profile, setProfile] = useState();

  useEffect(() => {
    (async () => {
      try {
        const response = await getEmployeeProfile(userStoreId);
        setProfile(response);
      } catch (error) {
        console.error("Error fetching employee profile:", error);
      }
    })();
  }, [userStoreId]);

  const PageBox = () => {
    return (
      <div className="fixed left-1/2 bottom-25 flex h-[45px] rounded-full divide-x-1 border-[1px] border-[#b3b3b3] divide-[#b3b3b3] shadow-[0_4px_4px_0_rgba(0,0,0,0.25)] overflow-hidden -translate-x-1/2">
        <span
          className={`flex items-center justify-center w-[70px] font-[510] text-[16px] cursor-pointer ${page === 1 ? "bg-white text-black" : "bg-[#b3b3b3] text-[#4e4e4e]"}`}
          onClick={() => setPage(1)}
        >
          정보
        </span>
        <span
          className={`flex items-center justify-center w-[70px] font-[510] text-[16px] cursor-pointer ${page === 2 ? "bg-white text-black" : "bg-[#b3b3b3] text-[#4e4e4e]"}`}
          onClick={() => setPage(2)}
        >
          근태
        </span>
      </div>
    );
  };

  const StatusBox = () => {
    const status = 1;
    return (
      <div className="flex h-[25px] rounded-full divide-x-1 border-[1px] border-[#b3b3b3] divide-[#b3b3b3] overflow-hidden">
        <span
          className={`flex items-center justify-center w-[45px] font-[510] text-[14px]  ${status === 1 ? "bg-[#b3b3b3]" : ""}`}
        >
          재사
        </span>
        <span
          className={`flex items-center justify-center w-[45px] font-[510] text-[14px] ${status === 2 ? "bg-[#b3b3b3]" : ""}`}
        >
          휴가
        </span>
        <span
          className={`flex items-center justify-center w-[45px] font-[510] text-[14px] ${status === 3 ? "bg-[#b3b3b3]" : ""}`}
        >
          퇴사
        </span>
      </div>
    );
  };

  const PositionBox = () => {
    const position = profile?.position === "STAFF" ? 2 : 1;
    return (
      <div className="flex h-[25px] rounded-full divide-x-1 border-[1px] border-[#b3b3b3] divide-[#b3b3b3] overflow-hidden">
        <span
          className={`flex items-center justify-center w-[68px] font-[510] text-[14px] ${position === 1 ? "bg-[#b3b3b3]" : ""}`}
        >
          매니저
        </span>
        <span
          className={`flex items-center justify-center w-[68px] font-[510] text-[14px] ${position === 2 ? "bg-[#b3b3b3]" : ""}`}
        >
          알바생
        </span>
      </div>
    );
  };

  const InfoPage = () => {
    return (
      <div className="flex flex-col w-full gap-5 mx-1">
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">상태</p>
          <StatusBox />
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">직급</p>
          <PositionBox />
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">{profile?.storeName}</p>
          <p className="font-[400] text-[16px]">RSSOL</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">계좌</p>
          <p className="font-[400] text-[16px]">
            {profile?.bankName} {profile?.accountNumber}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">전화번호</p>
          <p className="font-[400] text-[16px]">{profile?.email}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">입사일자</p>
          <p className="font-[400] text-[16px]">
            {profile?.hireDate} (+{profile?.daysWorked}일 째)
          </p>
        </div>
      </div>
    );
  };

  const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const firstDayOfMonth = currentDate.startOf("month");
    const lastDayOfMonth = currentDate.endOf("month");
    const firstWeekStart =
      firstDayOfMonth.day() === 6
        ? firstDayOfMonth.subtract(6, "day")
        : firstDayOfMonth.subtract(firstDayOfMonth.day(), "day");
    const lastWeekEnd =
      lastDayOfMonth.day() === 6
        ? lastDayOfMonth
        : lastDayOfMonth.add(6 - lastDayOfMonth.day(), "day");
    const totalWeeks = Math.ceil(lastWeekEnd.diff(firstWeekStart, "day") / 7);
    const weeks = [];
    for (let i = 0; i < totalWeeks; i++) {
      let arr = [];
      for (let j = 0; j < 7; j++) {
        arr.push(firstWeekStart.add(i * 7 + j, "day"));
      }
      weeks.push(arr);
    }

    useEffect(() => {
      (async () => {
        try {
          const response = await getEmployeeAttendance(
            userStoreId,
            firstDayOfMonth.format("YYYY-MM-DD"),
            lastDayOfMonth.format("YYYY-MM-DD"),
          );
          console.log(response);
        } catch (error) {
          console.error("Error fetching employee attendance:", error);
        }
      })();
    }, [currentDate]);

    return (
      <div>
        <div className="static flex items-center justify-between mb-10">
          <div className="absolute left-1/2 flex items-center justify-center gap-2 -translate-x-1/2">
            <LeftArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            />
            <p className="w-[60px] font-[700] text-[18px]">
              {currentDate.format("MM")}월
            </p>
            <RightArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            />
          </div>
          <PencilIcon className="absolute right-15 cursor-pointer -translate-x-1/2" />
        </div>
        <div className="flex flex-col w-full justify-center items-center">
          {weeks.map((week, index) => (
            <div
              key={index}
              className="flex flex-row h-[55px] justify-center items-center"
            >
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-[55px] h-full text-center text-[14px] font-[700] ${day.format("MM") == currentDate.format("MM") ? "text-black" : "text-[#b3b3b3]"}`}
                >
                  {day.format("D")}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const AttendPage = () => {
    return (
      <div>
        <Calendar />
      </div>
    );
  };

  return (
    <div className="static h-full flex flex-col bg-white pt-10 px-5">
      <BackButton />
      <div className="flex flex-col my-7 gap-5">
        <div className="flex flex-col items-start">
          <div className="size-[80px] bg-[#d9d9d9] rounded-full my-2"></div>
          <p className="font-[510] text-[30px] text-left">
            {profile?.username}
          </p>
        </div>

        {page === 1 && <InfoPage />}
        {page === 2 && <AttendPage />}
      </div>
      <PageBox />
      <Button className="fixed left-1/2 bottom-5 h-[60px] w-[368px] bg-[#b31b1b] text-white font-[500] text-[16px] -translate-x-1/2">
        삭제
      </Button>
    </div>
  );
}

export default EmployeeProfile;
