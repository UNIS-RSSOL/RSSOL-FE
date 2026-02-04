import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { TimePicker, ConfigProvider, DatePicker } from "antd";
import DayCalendar from "../../../components/calendar/DayCalendar.jsx";
import WeekCalendar from "../../../components/calendar/WeekCalendar.jsx";
import PencilIcon from "../../../assets/icons/PencilIcon.jsx";
import CalendarIcon from "../../../assets/icons/CalendarIcon.jsx";
import UserAddIcon from "../../../assets/icons/UserAddIcon.jsx";
import UserRightIcon from "../../../assets/icons/UserRightIcon.jsx";
import TrashIcon from "../../../assets/icons/TrashIcon.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import DeleteIcon from "../../../assets/icons/DeleteIcon.jsx";
import LeftArrowIcon from "../../../assets/icons/LeftArrowIcon.jsx";
import RightArrowIcon from "../../../assets/icons/RightArrowIcon.jsx";
import RoundTag from "../../../components/common/RoundTag.jsx";
import MessageModal from "../../../components/common/MessageModal.jsx";
import Button from "../../../components/common/Button.jsx";
import Modal from "../../../components/common/Modal.jsx";
import Toast from "../../../components/common/Toast.jsx";
import { getActiveStore } from "../../../services/MypageService.js";
import {
  addWorkShift,
  deleteWorkShift,
} from "../../../services/WorkShiftService.js";
import { createShiftSwapRequest } from "../../../services/ShiftSwapService.js";
import { createExtraShiftRequest } from "../../../services/ExtraShiftService.js";
import { getAllWorker } from "../../../services/StoreService.js";
import { CaretDownFilled } from "@ant-design/icons";

dayjs.locale("ko");

const globalStyles = `
  .ant-picker-dropdown {
    z-index: 10000 !important;
  }
`;

function OwnerCalendar() {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState("1");
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const [refreshKey, setRefreshKey] = useState(0); // 강제 새로고침을 위한 key
  const [formattedCurrentDate, setFormattedCurrentDate] = useState(
    today.year() + "." + (today.month() + 1) + " " + today.date(),
  );
  const [formattedCurrentWeek, setFormattedCurrentWeek] = useState(
    `${today.format("YY")}.${today.format("MM")} ${Math.ceil(today.date() / 7)}주차`,
  );

  // 근무표 확정 후 캘린더로 이동 시 데이터 새로고침
  useEffect(() => {
    if (location.state?.refresh || location.state?.confirmedSchedule) {
      console.log("🔄 근무표 확정 후 캘린더 새로고침");
      // 강제로 컴포넌트 리렌더링을 위해 key 변경
      setRefreshKey((prev) => prev + 1);
      // state 초기화 (다음 방문 시 중복 새로고침 방지)
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  //근무일정추가모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  //근무일정수정-이벤트블록 선택시 나타나는 토스트
  const [isEventToastOpen, setIsEventToastOpen] = useState(false);
  //대타요청하기
  const [isSubToastOpen, setIsSubToastOpen] = useState(false);
  const [isMsgOpen1, SetIsMsgOpen1] = useState(false);
  //추가근무요청
  const [addShiftToastOpen, setAddShiftToastOpen] = useState(false);
  const [isMsgOpen2, setIsMsgOpen2] = useState(false);
  //근무일정삭제
  const [isDeleteShift, setIsDeleteShift] = useState(false);
  const [isMsgOpen3, setIsMsgOpen3] = useState(false);
  const [eventData, setEventData] = useState();
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  const [needWorkers, setNeedWorkers] = useState(1);
  const [activeStore, setActiveStore] = useState("");
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [newTime, setNewTime] = useState({
    userStoreId: "",
    username: "",
    date: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await getActiveStore();
        console.log("🏪 활성 매장 정보:", response);
        setActiveStore(response.name);
        // 활성 매장 ID 저장 (storeId 또는 id 필드 사용)
        const storeId = response.storeId || response.id;
        console.log("🏪 활성 매장 ID:", storeId);
        if (storeId) {
          setActiveStoreId(storeId);
        } else {
          console.warn("⚠️ 활성 매장 ID를 찾을 수 없습니다:", response);
        }
      } catch (error) {
        console.error("❌ 활성 매장 조회 실패:", error);
      }
    })();
  }, []);

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

  const handleEventClick = (e) => {
    setSelectedCalendarEvent(e);
    console.log(e);
    setEventData({
      id: e.id,
      userStoreId: e.userStoreId,
      username: e.username,
      start: dayjs(e.start),
      end: dayjs(e.end),
    });
    setIsEventToastOpen(true);
  };

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
    const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const WorkersDropDown = () => {
    const [workers, setWorkers] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
      (async () => {
        const response = await getAllWorker();
        setWorkers(response);
      })();
    }, []);

    return (
      <div className="relative">
        <div
          className={`flex w-[70px] h-[30px] items-center justify-center border-[#87888C] py-[2px] bg-white gap-1 cursor-pointer ${dropdownOpen ? "border border-b-[#87888c] rounded-t-[7px]" : "border rounded-[7px]"}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="text-[12px] font-[400]">{newTime.username}</span>
        </div>
        {dropdownOpen && (
          <div className="absolute left-0 mt-0 rounded-b-[12px] border-x-1 border-b-1 overflow-hidden">
            {workers?.map((worker) => (
              <div
                key={worker.userStoreId}
                className="flex items-center justify-center w-[70px] py-[2px] bg-white gap-1 cursor-pointer"
                onClick={() => {
                  setNewTime((prev) => ({
                    ...prev,
                    userStoreId: worker.userStoreId,
                    username: worker.username,
                  }));
                  setDropdownOpen(false);
                }}
              >
                <span className="text-[12px] font-[400]">
                  {worker.username}
                </span>
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
        <div className="relative flex flex-row w-full justify-between items-center px-4 mb-2">
          <PencilIcon
            className="size-[20px] mr-[36px]"
            onClick={() => {
              setIsModalOpen(true);
            }}
          />

          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-row items-center justify-between">
            <LeftArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.subtract(1, "day"))}
            />
            <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] ">
              {formattedCurrentDate}
            </p>
            <RightArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.add(1, "day"))}
            />
          </div>
          <DropDown />
        </div>
        <DayCalendar
          key={`day-${refreshKey}-${currentDate.format("YYYY-MM-DD")}`}
          date={currentDate}
          onEventClick={handleEventClick}
          selectedEventProp={selectedCalendarEvent}
          setSelectedEventProp={setSelectedCalendarEvent}
          storeId={activeStoreId}
          refreshKey={refreshKey}
        />
      </div>
    );
  };

  const Week = () => {
    return (
      <div className="w-full flex flex-col items-center py-5">
        <div className="relative flex flex-row w-full justify-between items-center px-4 mb-2">
          <PencilIcon
            className="size-[20px] mr-[36px]"
            onClick={() => setIsModalOpen(true)}
          />

          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-row items-center justify-between">
            <LeftArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.subtract(1, "week"))}
            />
            <p className="h-[20px] w-[150px] text-[20px]/[20px] font-[600] ">
              {formattedCurrentWeek}
            </p>
            <RightArrowIcon
              className="cursor-pointer"
              onClick={() => setCurrentDate(currentDate.add(1, "week"))}
            />
          </div>
          <DropDown />
        </div>
        <WeekCalendar
          key={`week-${refreshKey}-${currentDate.format("YYYY-MM-DD")}`}
          date={currentDate}
          onEventClick={handleEventClick}
          selectedEventProp={selectedCalendarEvent}
          setSelectedEventProp={setSelectedCalendarEvent}
          storeId={activeStoreId}
          refreshKey={refreshKey}
        />
      </div>
    );
  };

  //대타요청하기
  const handleRequestSub = async () => {
    try {
      await createShiftSwapRequest(eventData.id);
      setIsSubToastOpen(false);
      SetIsMsgOpen1(true);
    } catch (error) {
      console.error(error);
    }
  };

  //추가 근무 요청
  const handleRequestWork = () => {
    (async () => {
      try {
        await createExtraShiftRequest(eventData.id, needWorkers);

        setAddShiftToastOpen(false);
        setIsMsgOpen2(true);
        setNeedWorkers(1);
      } catch (error) {
        console.error(error);
      }
    })();
  };

  //근무블록추가
  const handleAddWorkshift = async () => {
    try {
      const data = {
        userStoreId: newTime.userStoreId,
        start:
          newTime.date.format("YYYY-MM-DD") +
          "T" +
          newTime.start.format("HH:mm"),
        end:
          newTime.date.format("YYYY-MM-DD") + "T" + newTime.end.format("HH:mm"),
      };
      console.log(data);
      await addWorkShift(data.userStoreId, data.start, data.end);
      setNewTime({
        userStoreId: "",
        username: "",
        date: "",
        start: "",
        end: "",
      });
      setIsModalOpen(false);
      setIsMsgOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  //근무블록삭제
  const handleDeleteWorkshift = async () => {
    try {
      console.log(eventData.id);
      await deleteWorkShift(eventData.id);
      setIsDeleteShift(false);
      setIsMsgOpen3(true);
    } catch (error) {
      console.error(error);
    }
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
        {/*근무일정추가모달*/}
        {isModalOpen && (
          <Modal xx={true} onClose={() => setIsModalOpen(false)}>
            <div className="flex flex-col w-full items-center justify-center my-2 gap-3">
              <div className="flex flex-col w-full items-center justify-center">
                <p className="text-[16px] font-[400]">근무일정추가</p>
                <p className="text-[12px] font-[400]">
                  추가할 근무 일정을 선택해주세요!
                </p>
              </div>
              <div className="flex flex-col w-full gap-2">
                <div className="flex flex-row w-[285px] items-center gap-1">
                  <p className="flex-shrink-0 w-[30px] items-center text-[14px] font-[500] text-right">
                    날짜
                  </p>
                  <DatePicker
                    className="w-full"
                    style={{ borderColor: "#87888C" }}
                    disabledDate={(current) => {
                      return current && current < dayjs().startOf("day");
                    }}
                    suffixIcon={
                      <CalendarIcon className="size-[15px]" color="#87888c" />
                    }
                    onChange={(e) => setNewTime({ ...newTime, date: dayjs(e) })}
                  />
                </div>
                <div className="flex flex-row w-[285px] items-center gap-1">
                  <p className="w-[30px] items-center text-[14px] font-[500] text-right">
                    시간
                  </p>
                  <TimePicker
                    className="w-[61px] h-[30px]"
                    style={{ borderColor: "#87888C" }}
                    format="HH:mm"
                    minuteStep={5}
                    placeholder=""
                    suffixIcon=""
                    needConfirm={false}
                    disabledTime={() => ({
                      disabledHours: () => [...Array(8).keys()],
                    })}
                    hideDisabledOptions
                    onChange={(e) =>
                      setNewTime({ ...newTime, start: dayjs(e) })
                    }
                  />
                  <p>-</p>
                  <TimePicker
                    className="w-[61px] h-[30px]"
                    style={{ borderColor: "#87888C" }}
                    format="HH:mm"
                    minuteStep={5}
                    placeholder=""
                    suffixIcon=""
                    needConfirm={false}
                    disabledTime={() => ({
                      disabledHours: () => [...Array(8).keys()],
                    })}
                    hideDisabledOptions
                    onChange={(e) => setNewTime({ ...newTime, end: dayjs(e) })}
                  />
                  <p className="w-[40px] flex-shrink-0 text-[14px] font-[500] text-right gap-1">
                    근무자
                  </p>
                  <WorkersDropDown />
                </div>
              </div>
              <Button
                className="w-full h-[32px] text-[14px] font-[500]"
                onClick={handleAddWorkshift}
              >
                추가하기
              </Button>
            </div>
          </Modal>
        )}

        {/* 이벤트클릭시 나타나는 토스트 */}
        {isEventToastOpen && (
          <Toast
            isOpen={isEventToastOpen}
            onClose={() => setIsEventToastOpen(false)}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-row items-center justify-center">
                <p className="text-[16px] font-[600] mb-2">
                  {eventData.start.format("dd")}({eventData.username}){" "}
                  {eventData.start.format("HH:mm")}-
                  {eventData.end.format("HH:mm")}
                </p>
              </div>
              <Button
                className="h-[48px] text-[16px] font-[600] items-center relative"
                onClick={() => {
                  setIsEventToastOpen(false);
                  setAddShiftToastOpen(true);
                }}
              >
                <UserAddIcon className="absolute left-4" />
                <span className="w-full text-center">추가 근무 요청</span>
              </Button>
              <Button
                className="h-[48px] text-[16px] font-[600] items-center relative"
                onClick={() => {
                  setIsEventToastOpen(false);
                  setIsDeleteShift(true);
                }}
              >
                <TrashIcon className="absolute left-4" />
                <span className="w-full text-center">근무 일정 삭제하기</span>
              </Button>
            </div>
          </Toast>
        )}
        {/*대타요청하기*/}
        {isSubToastOpen && (
          <Toast
            isOpen={isSubToastOpen}
            onClose={() => setIsSubToastOpen(false)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-center items-center gap-2">
                <p className="text-[16px] font-[600]">대타 요청하기</p>
                <p className="text-[12px] font-[400]">
                  선택한 일정으로 대타를 요청할까요?
                </p>
              </div>
              <div className="flex flex-row items-center justify-center w-full gap-5">
                <RoundTag> {activeStore}</RoundTag>
                <span className="text-[14px] font-[500]">
                  {eventData.start.format("dd(DD) HH:mm-")}
                  {eventData.end.format("HH:mm")}
                </span>
              </div>
              <Button
                className="h-[48px] text-[16px] font-[600] items-center relative"
                onClick={handleRequestSub}
              >
                요청하기
              </Button>
            </div>
          </Toast>
        )}

        {/* 추가 근무 요청 */}
        {addShiftToastOpen && (
          <Toast
            isOpen={addShiftToastOpen}
            onClose={() => setAddShiftToastOpen(false)}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col justify-center items-center gap-2">
                <p className="text-[16px] font-[600]">추가 근무 요청하기</p>
                <p className="text-[12px] font-[400]">
                  선택한 일정에 {needWorkers}명으로 추가 근무를 요청할까요?
                </p>
              </div>
              <div className="flex flex-row items-center justify-between w-full">
                <div className="w-[100px]">
                  <RoundTag> {activeStore}</RoundTag>
                </div>
                <span className="text-[14px] font-[500]">
                  {eventData.start.format("dd(DD) HH:mm-")}
                  {eventData.end.format("HH:mm")}
                </span>
                <div className="flex flex-row w-[100px] items-center gap-3">
                  <DeleteIcon
                    className="size-[20px]"
                    onClick={() => setNeedWorkers(Math.max(needWorkers - 1, 1))}
                  />
                  <p className="flex w-[20px] text-[14px] font-[500] justify-center">
                    {needWorkers}
                  </p>
                  <AddIcon
                    className="size-[20px] cursor-pointer"
                    onClick={() => setNeedWorkers(needWorkers + 1)}
                  />
                </div>
              </div>
              <Button
                className="h-[48px] text-[16px] font-[600] items-center relative"
                onClick={() => {
                  handleRequestWork();
                }}
              >
                요청하기
              </Button>
            </div>
          </Toast>
        )}
        {/* 근무 일정 삭제 모달 */}
        {isDeleteShift && (
          <Modal>
            <div className="flex flex-col items-center justify-center gap-3 my-2">
              <div className="flex flex-col items-center justify-center gap-1">
                <p className="text-[16px] font-[400]">근무 일정 삭제</p>
                <p className="text-[12px] font-[400]">
                  선택한 근무 일정을 삭제할까요?
                </p>
              </div>
              <div className="flex flex-row items-center gap-3">
                <RoundTag>{activeStore}</RoundTag>
                <span className="text-[14px] font-[500]">
                  {eventData.start.format("dd(DD) HH:mm-")}
                  {eventData.end.format("HH:mm")}
                </span>
              </div>
              <div className="flex flex-row w-full items-center gap-2">
                <Button
                  className="h-[33px] bg-[#fdfffe] border-[1px] border-[#26272a] flex-1/2 text-[14px] font-[400]"
                  onClick={() => {
                    setIsDeleteShift(false);
                  }}
                >
                  아니오
                </Button>
                <Button
                  className="h-[33px] flex-1/2 text-[14px] font-[400]"
                  onClick={handleDeleteWorkshift}
                >
                  예
                </Button>
              </div>
            </div>
          </Modal>
        )}
        <MessageModal
          message="근무 일정이 추가 완료되었어요!"
          isOpen={isMsgOpen}
          onClose={() => setIsMsgOpen(false)}
        />
        <MessageModal
          message="요청이 완료되었어요."
          isOpen={isMsgOpen2}
          onClose={() => setIsMsgOpen2(false)}
        />
        <MessageModal
          message="근무 일정이 삭제되었어요!"
          isOpen={isMsgOpen3}
          onClose={() => setIsMsgOpen3(false)}
        />
        <MessageModal
          message="요청이 완료되었어요."
          isOpen={isMsgOpen1}
          onClose={() => SetIsMsgOpen1(false)}
        />
      </div>
    </ConfigProvider>
  );
}

export default OwnerCalendar;
