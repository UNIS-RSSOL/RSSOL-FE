import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import koLocale from "@fullcalendar/core/locales/ko";
import "./DayCalendar.css";
import { useState } from "react";
import interactionPlugin from "@fullcalendar/interaction";

function DayCalendar() {
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

  return (
    <div className="w-[330px]">
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
    </div>
  );
}
export default DayCalendar;
