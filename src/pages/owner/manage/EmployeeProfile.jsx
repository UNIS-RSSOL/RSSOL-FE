import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon";
import BackButton from "../../../components/common/BackButton";
import Button from "../../../components/common/Button";
import PencilIcon from "../../../assets/icons/PencilIcon";
import PillToggle from "../../../components/common/PillToggle";
import { getEmployeeAttendance } from "../../../services/ViewAttendanceService";
import { getEmployeeProfile } from "../../../services/ViewProfileService";

function EmployeeProfile() {
  const { userStoreId } = useParams();
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

  const pageToggleTabs = [
    { key: "1", label: "정보" },
    { key: "2", label: "근태" },
  ];

  const StatusBox = () => {
    const status =
      profile?.status === "HIRED"
        ? 1
        : profile?.status === "ON_LEAVING"
          ? 2
          : 3;
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
      <div className="flex flex-col w-full gap-5">
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">상태</p>
          <StatusBox />
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">직급</p>
          <PositionBox />
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">근무 매장</p>
          <p className="font-[400] text-[16px]">{profile?.storeName}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">계좌</p>
          <p className="font-[400] text-[16px]">
            {profile?.bankName} {profile?.accountNumber}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="font-[400] text-[16px]">이메일</p>
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
    const [attendance, setAttendance] = useState(null);
    const [weeks, setWeeks] = useState([]);

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

    const dayOfMonth = [];
    let i = firstDayOfMonth;
    while (!i.isAfter(lastDayOfMonth, "day")) {
      dayOfMonth.push(i.format("YYYY-MM-DD"));
      i = i.add(1, "day");
    }

    useEffect(() => {
      (async () => {
        try {
          const today = dayjs();
          const end =
            currentDate.format("M") === today.format("M")
              ? today.format("YYYY-MM-DD")
              : lastDayOfMonth.format("YYYY-MM-DD");
          const response = await getEmployeeAttendance(
            userStoreId,
            firstDayOfMonth.format("YYYY-MM-DD"),
            end,
          );
          setAttendance(response);
        } catch (error) {
          console.error("Error fetching employee attendance:", error);
        }
      })();
    }, [currentDate]);

    useEffect(() => {
      if (!attendance) return;

      const attendanceMap = {};
      attendance.attendances.forEach((item) => {
        attendanceMap[item.workDate] = item;
      });

      const newWeeks = [];
      for (let i = 0; i < totalWeeks; i++) {
        let arr = [];
        for (let j = 0; j < 7; j++) {
          const targetDate = firstWeekStart
            .add(i * 7 + j, "day")
            .format("YYYY-MM-DD");
          if (attendanceMap[targetDate]) {
            arr.push(attendanceMap[targetDate]);
          } else {
            arr.push({
              workDate: targetDate,
              attendanceStatus: "OFF",
            });
          }
        }
        newWeeks.push(arr);
      }
      setWeeks(newWeeks);
    }, [attendance]);

    return (
      <div className="">
        <div className="flex w-full items-center justify-between mb-20">
          <div className="flex flex-row w-full items-center justify-center gap-2">
            <LeftArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            />
            <p className="w-[100px] font-[700] text-[18px] text-center">
              {currentDate.format("MM")}월
            </p>
            <RightArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            />
          </div>
        </div>
        <div className="flex flex-col w-full justify-center items-center">
          {weeks.map((week, index) => (
            <div
              key={index}
              className="flex flex-row w-full h-[60px] justify-center items-center"
            >
              {week.map((day) => (
                <div
                  key={day.workDate}
                  className="flex flex-col w-full min-w-[50px] max-w-[100px] h-full items-center"
                >
                  <span
                    className={`text-[14px] font-[700] text-center ${dayjs(day.workDate).format("M") === currentDate.format("M") ? "text-black" : "text-[#B3B3B3]"}`}
                  >
                    {dayjs(day.workDate).format("D")}
                  </span>
                  <div
                    className={`flex size-[18px] rounded-full ${day.attendanceStatus === "ABSENT" ? "bg-[#E2E2E2]" : day.attendanceStatus === "LATE" ? "bg-[#B3B3B3]" : day.attendanceStatus === "ATTENDANCE" ? "bg-[#616161]" : "bg-white"}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 mt-5">
          <div className="flex flex-row items-center gap-2">
            <div className="justify-center bg-[#616161] rounded-full size-[18px]"></div>
            <span>정상 출근 {attendance?.totalAttendance}회</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="justify-center bg-[#b3b3b3] rounded-full size-[18px]"></div>
            <span>지각 {attendance?.totalLateCount}회</span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="justify-center bg-[#E2E2E2] rounded-full size-[18px]"></div>
            <span>결근 {attendance?.totalAbsentCount}회</span>
          </div>
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
      <div className="flex flex-col my-7 gap-5 overflow-y-auto mb-20">
        <div className="flex flex-col items-start">
          <div className="flex justify-center items-center size-[80px] bg-[#d9d9d9] rounded-full my-2 overflow-hidden">
            <img src={profile?.profileImageUrl} className="size-[80px]" />
          </div>
          <p className="font-[510] text-[30px] text-left">
            {profile?.username}
          </p>
        </div>

        {page === 1 && <InfoPage />}
        {page === 2 && <AttendPage />}
      </div>
      <div className="fixed left-1/2 bottom-25 -translate-x-1/2">
        <PillToggle
          tabs={pageToggleTabs}
          activeKey={String(page)}
          onChange={(key) => setPage(Number(key))}
        />
      </div>
      <div className="flex fixed bottom-0 left-3 right-3 justify-center items-center bg-white">
        <Button className="h-[60px] bg-[#b31b1b] text-white font-[500] text-[16px] my-3">
          삭제
        </Button>
      </div>
    </div>
  );
}

export default EmployeeProfile;
