import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { TimePicker, ConfigProvider, DatePicker } from "antd";
import DayCalendar from "../../../components/calendar/DayCalendar.jsx";
import WeekCalendar from "../../../components/calendar/WeekCalendar.jsx";
import CalendarIcon from "../../../assets/icons/CalendarIcon.jsx";
import UserAddIcon from "../../../assets/icons/UserAddIcon.jsx";
import TrashIcon from "../../../assets/icons/TrashIcon.jsx";
import AddIcon from "../../../assets/icons/AddIcon.jsx";
import DeleteIcon from "../../../assets/icons/DeleteIcon.jsx";
import DateNavigation from "../../../components/common/DateNavigation.jsx";
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
import HomeHeader from "../../../components/home/HomeHeader.jsx";
import BellIcon from "../../../assets/icons/BellIcon.jsx";
import BottomNav from "../../../components/layout/BottomNav.jsx";
import PillToggle from "../../../components/common/PillToggle.jsx";

dayjs.locale("ko");

const globalStyles = `
  .ant-picker-dropdown {
    z-index: 10000 !important;
  }
`;

/* ── 근무자 드롭다운 (컴포넌트 외부 정의) ── */
function WorkersDropDown({ selected, onSelect }) {
  const [workers, setWorkers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllWorker();
        setWorkers(response);
      } catch (error) {
        console.error("근무자 목록 조회 실패:", error);
      }
    })();
  }, []);

  return (
    <div className="relative">
      <div
        className={`flex w-[70px] h-[30px] items-center justify-center border-[#87888C] py-[2px] bg-white gap-1 cursor-pointer ${dropdownOpen ? "border border-b-[#87888c] rounded-t-[7px]" : "border rounded-[7px]"}`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="text-[12px] font-[400]">{selected}</span>
      </div>
      {dropdownOpen && (
        <div className="absolute left-0 mt-0 rounded-b-[12px] border-x-1 border-b-1 overflow-hidden">
          {workers?.map((worker) => (
            <div
              key={worker.userStoreId}
              className="flex items-center justify-center w-[70px] py-[2px] bg-white gap-1 cursor-pointer"
              onClick={() => {
                onSelect(worker);
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
}

/* ── 메인 컴포넌트 ── */
function OwnerCalendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("1");
  const today = dayjs();
  const [currentDate, setCurrentDate] = useState(today);
  const [refreshKey, setRefreshKey] = useState(0);

  const formattedCurrentDate = currentDate.format("YYYY.MM.DD(dd)");
  const startOfWeek = currentDate.startOf("week");
  const formattedCurrentWeek = `${startOfWeek.format("YYYY.MM.DD")} - ${startOfWeek.add(6, "day").format("YYYY.MM.DD")}`;

  // 근무표 확정 후 캘린더로 이동 시 데이터 새로고침
  useEffect(() => {
    if (location.state?.refresh || location.state?.confirmedSchedule) {
      setRefreshKey((prev) => prev + 1);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // 모달/토스트 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMsgOpen, setIsMsgOpen] = useState(false);
  const [isEventToastOpen, setIsEventToastOpen] = useState(false);
  const [isSubToastOpen, setIsSubToastOpen] = useState(false);
  const [isMsgOpen1, SetIsMsgOpen1] = useState(false);
  const [addShiftToastOpen, setAddShiftToastOpen] = useState(false);
  const [isMsgOpen2, setIsMsgOpen2] = useState(false);
  const [isDeleteShift, setIsDeleteShift] = useState(false);
  const [isMsgOpen3, setIsMsgOpen3] = useState(false);

  // 데이터 상태
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

  // 활성 매장 로딩
  useEffect(() => {
    (async () => {
      try {
        const response = await getActiveStore();
        setActiveStore(response.name);
        const storeId = response.storeId || response.id;
        if (storeId) setActiveStoreId(storeId);
      } catch (error) {
        console.error("활성 매장 조회 실패:", error);
      }
    })();
  }, []);

  /* ── 이벤트 핸들러 ── */

  const handleEventClick = (e) => {
    setSelectedCalendarEvent(e);
    setEventData({
      id: e.id,
      userStoreId: e.userStoreId,
      username: e.username,
      start: dayjs(e.start),
      end: dayjs(e.end),
    });
    setIsEventToastOpen(true);
  };

  const handleViewChange = (key) => {
    setSelectedKey(key);
    setCurrentDate(today);
  };

  const handleRequestSub = async () => {
    try {
      await createShiftSwapRequest(eventData.id);
      setIsSubToastOpen(false);
      SetIsMsgOpen1(true);
    } catch (error) {
      console.error("대타 요청 실패:", error);
    }
  };

  const handleRequestWork = async () => {
    try {
      await createExtraShiftRequest(eventData.id, needWorkers);
      setAddShiftToastOpen(false);
      setIsMsgOpen2(true);
      setNeedWorkers(1);
    } catch (error) {
      console.error("추가 근무 요청 실패:", error);
    }
  };

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
      console.error("근무 블록 추가 실패:", error);
    }
  };

  const handleDeleteWorkshift = async () => {
    try {
      await deleteWorkShift(eventData.id);
      setIsDeleteShift(false);
      setIsMsgOpen3(true);
    } catch (error) {
      console.error("근무 블록 삭제 실패:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard relative">
      <HomeHeader
        storeName={activeStore}
        onMenuClick={() => navigate("/owner")}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/owner/notification/home")}
      />

      <main className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <ConfigProvider
          theme={{
            components: {
              TimePicker: {
                zIndexPopup: 10001,
              },
            },
          }}
        >
          <div className="flex-1 flex flex-col">
            <style>{globalStyles}</style>
            {selectedKey === "1" ? (
              <div className="w-full h-full flex flex-col py-5 px-[16px]">
                <DateNavigation
                  label={formattedCurrentDate}
                  onPrev={() => setCurrentDate(currentDate.subtract(1, "day"))}
                  onNext={() => setCurrentDate(currentDate.add(1, "day"))}
                />
                <DayCalendar
                  className="flex-1"
                  key={`day-${refreshKey}-${currentDate.format("YYYY-MM-DD")}`}
                  date={currentDate}
                  onEventClick={handleEventClick}
                  selectedEventProp={selectedCalendarEvent}
                  setSelectedEventProp={setSelectedCalendarEvent}
                  storeId={activeStoreId}
                  refreshKey={refreshKey}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col py-5 px-[16px]">
                <DateNavigation
                  label={formattedCurrentWeek}
                  onPrev={() => setCurrentDate(currentDate.subtract(1, "week"))}
                  onNext={() => setCurrentDate(currentDate.add(1, "week"))}
                />
                <WeekCalendar
                  className="flex-1"
                  key={`week-${refreshKey}-${currentDate.format("YYYY-MM-DD")}`}
                  date={currentDate}
                  onEventClick={handleEventClick}
                  selectedEventProp={selectedCalendarEvent}
                  setSelectedEventProp={setSelectedCalendarEvent}
                  storeId={activeStoreId}
                  refreshKey={refreshKey}
                />
              </div>
            )}

            {/* 근무일정 추가 모달 */}
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
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                        suffixIcon={
                          <CalendarIcon className="size-[15px]" color="#87888c" />
                        }
                        onChange={(e) =>
                          setNewTime({ ...newTime, date: dayjs(e) })
                        }
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
                        onChange={(e) =>
                          setNewTime({ ...newTime, end: dayjs(e) })
                        }
                      />
                      <p className="w-[40px] flex-shrink-0 text-[14px] font-[500] text-right gap-1">
                        근무자
                      </p>
                      <WorkersDropDown
                        selected={newTime.username}
                        onSelect={(worker) =>
                          setNewTime((prev) => ({
                            ...prev,
                            userStoreId: worker.userStoreId,
                            username: worker.username,
                          }))
                        }
                      />
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

            {/* 이벤트 클릭 토스트 */}
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

            {/* 대타 요청 토스트 */}
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

            {/* 추가 근무 요청 토스트 */}
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
                        onClick={() =>
                          setNeedWorkers(Math.max(needWorkers - 1, 1))
                        }
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
                    onClick={handleRequestWork}
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
                      onClick={() => setIsDeleteShift(false)}
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
      </main>

      {/* 일간/주간 토글 + 추가 버튼 (네비바 위 플로팅) */}
      <div className="absolute bottom-[68px] left-0 w-full flex flex-row items-center justify-center px-4 pointer-events-none z-10">
        <div className="flex-1" />
        <div className="pointer-events-auto">
          <PillToggle
            tabs={[
              { key: "1", label: "일간" },
              { key: "2", label: "주간" },
            ]}
            activeKey={selectedKey}
            onChange={handleViewChange}
          />
        </div>
        <div className="flex-1 flex justify-end pointer-events-auto">
          <div
            className="w-[50px] h-[50px] rounded-full border-[1px] border-[#B3B3B3] bg-white flex items-center justify-center cursor-pointer shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]"
            onClick={() => setIsModalOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="#87888C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <BottomNav role="owner" activePage="calendar" />
    </div>
  );
}

export default OwnerCalendar;
