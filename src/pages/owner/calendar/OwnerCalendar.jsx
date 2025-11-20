import DayCalendar from "../../../components/common/calendar/DayCalendar.jsx";
import WeekCalendar from "../../../components/common/calendar/WeekCalendar.jsx";
import PencilIcon from "../../../assets/icons/PencilIcon.jsx";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  LeftOutlined,
  RightOutlined,
  CaretDownFilled,
} from "@ant-design/icons";

function OwnerCalendar() {
  const [selectedKey, setSelectedKey] = useState("1");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const [formattedCurrentDate, setFormattedCurrentDate] = useState(
    today.year() + "." + (today.month() + 1) + " " + today.date(),
  );

  useEffect(() => {
    setFormattedCurrentDate(
      currentDate.year() +
        "." +
        (currentDate.month() + 1) +
        " " +
        currentDate.date(),
    );
  }, [currentDate]);

  const items = [
    {
      label: "일간",
      key: "1",
      onClick: () => {
        setSelectedKey("1");
      },
    },
    {
      label: "주간",
      key: "2",
      onClick: () => {
        setSelectedKey("2");
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
                onClick={() => {
                  setSelectedKey(item.key);
                  setDropdownOpen(false);
                }}
              >
                <span className="text-[12px] font-[400]">{item.label}</span>
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
          <PencilIcon className="size-[20px] mr-[36px]" />

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

  return (
    <div>
      <Day />
    </div>
  );
}

export default OwnerCalendar;
