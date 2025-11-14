import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import koLocale from "@fullcalendar/core/locales/ko";
import "./DayCalendar.css";
import { useState } from "react";
import interactionPlugin from "@fullcalendar/interaction";
import PencilIcon from "../../../assets/icons/PencilIcon.jsx";
import { Dropdown, Button, Space } from "antd";
import {
  CaretDownFilled,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";

function DayCalendar() {
  const [menu, setMenu] = useState("주간");
  const [date, newDate] = useState(new Date());
  const [events] = useState([
    {
      title: "시현",
      start: "2025-11-11T08:00:00",
      end: "2025-11-11T13:00:00",
      backgroundColor: "#68E194",
      borderColor: "#68E194",
      textColor: "black",
      classNames: ["custom-event"],
    },
    {
      title: "민솔",
      start: "2025-11-12T08:00:00",
      end: "2025-11-12T13:00:00",
      backgroundColor: "#68E194",
      borderColor: "#68E194",
      textColor: "black",
      classNames: ["custom-event"],
    },
    {
      title: "채은",
      start: "2025-11-12T13:00:00",
      end: "2025-11-12T18:00:00",
      backgroundColor: "#32D1AA",
      borderColor: "#32D1AA",
      textColor: "black",
      classNames: ["custom-event"],
    },
    {
      title: "서진",
      start: "2025-11-13T13:00:00",
      end: "2025-11-13T18:00:00",
      backgroundColor: "#32D1AA",
      borderColor: "#32D1AA",
      textColor: "black",
      classNames: ["custom-event"],
    },
    {
      title: "지유",
      start: "2025-11-14T13:00:00",
      end: "2025-11-14T18:00:00",
      backgroundColor: "#32D1AA",
      borderColor: "#32D1AA",
      textColor: "black",
      classNames: ["custom-event"],
    },
    {
      title: "시은",
      start: "2025-11-14T18:00:00",
      end: "2025-11-14T24:00:00",
      backgroundColor: "#00C1BD",
      borderColor: "#00C1BD",
      textColor: "black",
      classNames: ["custom-event"],
    },
    {
      title: "혜민",
      start: "2025-11-15T18:00:00",
      end: "2025-11-15T24:00:00",
      backgroundColor: "#00C1BD",
      borderColor: "#00C1BD",
      textColor: "black",
      classNames: ["custom-event"],
    },
  ]);

  const renderEventContent = (eventInfo) => {
    return <div className="fc-event-title">{eventInfo.event.title}</div>;
  };

  const formattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month} ${day}`;
  };

  return (
    <div className="w-[330px]">
      <div className="flex justify-between items-center mb-2">
        <PencilIcon />
        <div className="flex items-center">
          <LeftOutlined className="cursor-pointer" />
          <p className="text-[20px] font-[600] mx-3">{formattedDate(date)}</p>
          <RightOutlined className="cursor-pointer" />
        </div>
        <Dropdown
          className="w-[60px] h-[20px]"
          menu={{
            items: [
              {
                key: "1",
                label: "일간",
                onClick: () => setMenu("일간"),
              },
              {
                key: "2",
                label: "주간",
                onClick: () => setMenu("주간"),
              },
            ],
          }}
        >
          <a className="w-[60px] h-[25px] rounded-[20px] border border-black flex justify-center items-center bg-[#fdfffe]">
            <p className="text-[12px] font-[400] text-black mr-1">{menu}</p>
            <CaretDownFilled style={{ color: "black" }} />
          </a>
        </Dropdown>
      </div>

      {menu === "일간" ? (
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={koLocale}
          headerToolbar={false}
          height="auto"
          firstDay={1}
          expandRows={true}
          allDaySlot={false}
          dayHeaderFormat={{ weekday: "short" }}
          slotDuration={"01:00:00"}
          slotMinTime={"08:00:00"}
          slotMaxTime={"24:00:00"}
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            meridiem: false,
          }}
          slotLabelContent={(arg) => {
            if (arg.date.getMinutes() === 0) {
              return <span>&nbsp;{arg.text}&nbsp;</span>;
            }
            return null;
          }}
          events={events}
          eventContent={renderEventContent}
        />
      ) : (
        <div>주간</div>
      )}
    </div>
  );
}
export default DayCalendar;
