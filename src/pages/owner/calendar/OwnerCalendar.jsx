import DayCalendar from "../../../components/common/calendar/DayCalendar.jsx";
import WeekCalendar from "../../../components/common/calendar/WeekCalendar.jsx";
import PencilIcon from "../../../assets/icons/PencilIcon.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import Modal from "../../../components/common/Modal.jsx";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  LeftOutlined,
  RightOutlined,
  CaretDownFilled,
} from "@ant-design/icons";
import { TimePicker, ConfigProvider, Input } from "antd";

// Add global style for TimePicker dropdown
const globalStyles = `
  .ant-picker-dropdown {
    z-index: 10000 !important;
  }
`;

function OwnerCalendar() {
  const [selectedKey, setSelectedKey] = useState("1");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const [formattedCurrentDate, setFormattedCurrentDate] = useState(
    today.year() + "." + (today.month() + 1) + " " + today.date(),
  );
  const [formattedCurrentWeek, setFormattedCurrentWeek] = useState(
    `${today.format("YY")}.${today.format("MM")} ${Math.ceil(today.date() / 7)}주차`,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTime, setNewTime] = useState({ day: "", start: "", end: "" });
  const week = ["월", "화", "수", "목", "금", "토", "일"];
  const [weekDropOpen, setWeekDropOpen] = useState(false);

  useEffect(() => {
    setFormattedCurrentDate(
      currentDate.year() +
        "." +
        (currentDate.month() + 1) +
        " " +
        currentDate.date(),
    );
    setFormattedCurrentWeek(
      `${currentDate.format("YY")}.${currentDate.format("MM")} ${Math.ceil(currentDate.date() / 7)}주차`,
    );
  }, [currentDate]);

  const items = [
    {
      label: "일간",
      key: "1",
      onClick: () => {
        setSelectedKey("1");
        setCurrentDate(today);
        setDropdownOpen(false);
      },
    },
    {
      label: "주간",
      key: "2",
      onClick: () => {
        setSelectedKey("2");
        setCurrentDate(today);
        setDropdownOpen(false);
      },
    },
  ];

  const DropDown = () => {
    return (
      <div className="relative">
        <div
          className={`flex w-[60px] items-center justify-center py-[2px] bg-white gap-1 cursor-pointer ${dropdownOpen ? "border border-b-[#87888c] rounded-t-[12px]" : "border rounded-full"}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="text-[12px] font-[400]">
            {items.find((item) => item.key === selectedKey)?.label}
          </span>
          <CaretDownFilled />
        </div>
        {dropdownOpen && (
          <div className="absolute left-0 mt-0 rounded-b-[12px] border-x-1 border-b-1 overflow-hidden">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-center w-[60px] py-[2px] bg-white gap-1 cursor-pointer"
                onClick={item.onClick}
              >
                <span className="text-[12px] font-[400]">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const WeekDropDown = () => {
    const [selectedDay, setSelectedDay] = useState(week[0]);
    useEffect(() => {
      if (newTime.day) {
        setSelectedDay(newTime.day);
      }
    }, [newTime.day]);
    return (
      <div className="relative">
        <div
          className={`flex w-[57px] h-[30px] items-center justify-center py-[2px] bg-white gap-1 cursor-pointer ${weekDropOpen ? "border border-b-[#87888c] rounded-t-[10px]" : "border rounded-[10px]"}`}
          onClick={() => setWeekDropOpen(!weekDropOpen)}
        >
          <span className="text-[14px] font-[400]">{selectedDay}</span>
          <CaretDownFilled />
        </div>
        {weekDropOpen && (
          <div className="absolute left-0 mt-0 rounded-b-[10px] border-x-1 border-b-1 overflow-hidden">
            {week.map((day) => (
              <div
                key={day}
                className="flex items-center justify-center w-[57px] py-[2px] bg-white gap-1 cursor-pointer"
                onClick={() => {
                  setSelectedDay(day);
                  setNewTime({ ...newTime, day: day });
                  setWeekDropOpen(false);
                  console.log(day);
                }}
              >
                <span className="text-[12px] font-[400]">{day}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Day = () => {
    return (
      <div className="w-full flex flex-col items-center py-5">
        <div className="flex flex-row w-full justify-between items-center px-4 mb-2">
          <PencilIcon
            className="size-[20px] mr-[36px]"
            onClick={() => {
              setIsModalOpen(true);
            }}
          />

          <div className="flex flex-row items-center justify-between">
            <LeftOutlined
              onClick={() => setCurrentDate(currentDate.subtract(1, "day"))}
            />
            <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] ">
              {formattedCurrentDate}
            </p>
            <RightOutlined
              onClick={() => setCurrentDate(currentDate.add(1, "day"))}
            />
          </div>
          <DropDown />
        </div>
        <DayCalendar date={currentDate} />
      </div>
    );
  };

  const Week = () => {
    return (
      <div className="w-full flex flex-col items-center py-5">
        <div className="flex flex-row w-full justify-between items-center px-4 mb-2">
          <PencilIcon
            className="size-[20px] mr-[36px]"
            onClick={() => setIsModalOpen(true)}
          />

          <div className="flex flex-row items-center justify-between">
            <LeftOutlined
              onClick={() => {
                const newDate = dayjs(currentDate).subtract(1, "week");
                setCurrentDate(newDate);
              }}
            />
            <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] text-center">
              {formattedCurrentWeek}
            </p>
            <RightOutlined
              onClick={() => {
                const newDate = dayjs(currentDate).add(1, "week");
                setCurrentDate(newDate);
              }}
            />
          </div>
          <DropDown />
        </div>
        <WeekCalendar date={currentDate} />
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          TimePicker: {
            zIndexPopup: 10001,
          },
        },
      }}
    >
      <div>
        <style>{globalStyles}</style>
        {selectedKey === "1" ? <Day /> : <Week />}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col w-full items-center justify-center my-2 gap-3">
              <div className="flex flex-col w-full items-center justify-center">
                <p className="text-[16px] font-[400]">근무일정추가</p>
                <p className="text-[12px] font-[400]">
                  추가할 근무 일정을 선택해주세요!
                </p>
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex flex-row w-full items-center gap-1">
                  <p className="w-[40px] items-center text-[14px] font-[500] text-right">
                    요일
                  </p>
                  <WeekDropDown />
                  <p className="text-[14px] font-[500] ml-2">시간</p>
                  <TimePicker
                    className="w-[61px] h-[30px]"
                    style={{ borderColor: "#26272a" }}
                    format="HH:mm"
                    minuteStep="5"
                    value={newTime.start}
                    placeholder=""
                    suffixIcon=""
                  />
                  <p>-</p>
                  <TimePicker
                    className="w-[61px] h-[30px]"
                    style={{ borderColor: "#26272a" }}
                    format="HH:mm"
                    minuteStep="5"
                    value={newTime.end}
                    placeholder=""
                    suffixIcon=""
                  />
                </div>
                <div className="flex flex-row w-full items-center gap-1">
                  <p className="w-[40px] flex-shrink-0 text-[14px] font-[500] text-right gap-1">
                    근무자
                  </p>
                  <Input
                    className="rounded-[10px] border-[#87888c]"
                    style={{ width: "235px" }}
                  />
                </div>
              </div>
              <GreenBtn className="w-full h-[35px] text-[14px] font-[500]">
                추가하기
              </GreenBtn>
            </div>
          </Modal>
        )}
      </div>
    </ConfigProvider>
  );
}

export default OwnerCalendar;
