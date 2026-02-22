import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClockCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";

import {
  getOwnerStore,
  updateOwnerStore,
} from "../../services/MypageService.js";

import Button from "../../components/common/Button.jsx";
import BackButton from "../../components/common/BackButton.jsx";
import TimeRangeSelect from "../../components/common/TimeRangeSelect.jsx";
import ToggleHeader from "../../components/common/ToggleHeader.jsx";

// 파트 타임 라벨
const getPartTimeLabel = (index) => {
  if (index === 0) return "오픈";
  if (index === 1) return "미들";
  if (index === 2) return "마감";
  return `구간 ${index + 1}`;
};

function StoreSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  // 매장 정보
  const [storeName, setStoreName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");

  // 스케줄 정보
  const [operatingHours, setOperatingHours] = useState({
    start: "09:00",
    end: "22:00",
  });
  const [partTimeEnabled, setPartTimeEnabled] = useState(true);
  const [partTimes, setPartTimes] = useState([
    { start: "09:00", end: "14:00" },
    { start: "14:00", end: "18:00" },
    { start: "18:00", end: "22:00" },
  ]);
  const [breakTimeEnabled, setBreakTimeEnabled] = useState(true);
  const [breakTime, setBreakTime] = useState({
    start: "14:00",
    end: "15:00",
  });

  useEffect(() => {
    (async () => {
      try {
        const store = await getOwnerStore();
        setStoreName(store.name || "");
        setStoreAddress(store.address || "");
        setStorePhone(store.phoneNumber || "");
        setBusinessNumber(store.businessRegistrationNumber || "");
        // TODO: 스케줄 정보 API 연결 시 여기서 로드
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  const handleAddPartTime = () => {
    const lastEnd =
      partTimes.length > 0
        ? partTimes[partTimes.length - 1].end
        : operatingHours.start;
    setPartTimes((prev) => [
      ...prev,
      { start: lastEnd, end: operatingHours.end },
    ]);
  };

  const handleRemovePartTime = (index) => {
    if (partTimes.length <= 1) return;
    setPartTimes((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePartTimeChange = (index, field, value) => {
    setPartTimes((prev) =>
      prev.map((pt, i) => (i === index ? { ...pt, [field]: value } : pt)),
    );
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === "info") {
        await updateOwnerStore(storeName, storeAddress, storePhone);
      } else {
        // TODO: 스케줄 정보 저장 API 연결
        console.log("스케줄 저장:", {
          operatingHours,
          partTimeEnabled,
          partTimes: partTimeEnabled ? partTimes : [],
          breakTimeEnabled,
          breakTime: breakTimeEnabled ? breakTime : null,
        });
      }
      navigate(-1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-center py-10 px-4 font-Pretendard overflow-x-hidden">
      {/* 상단 이전 버튼 */}
      <div className="absolute top-10 left-5 flex justify-start w-full">
        <BackButton onClick={() => navigate(-1)} />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="w-full max-w-[393px] mt-8 flex flex-col items-center px-[8px] pb-[80px]">
        {/* 매장 이름 + 편집 아이콘 */}
        <div className="w-full mb-8">
          {isEditingName ? (
            <div className="flex items-center gap-[8px]">
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                autoFocus
                className="text-[30px] font-[700] border-b border-black outline-none w-full text-left"
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-[8px] cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              <h2 className="text-[30px] font-[700] text-left">
                {storeName || "매장 이름"}
              </h2>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M13.5 1.5L16.5 4.5M1.5 16.5L2.25 13.5L13.5 2.25L15.75 4.5L4.5 15.75L1.5 16.5Z"
                  stroke="#87888c"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* 정보 탭 */}
        {activeTab === "info" && (
          <div className="flex flex-col gap-[17.5px] w-full">
            {[
              {
                label: "매장 주소",
                value: storeAddress,
                onChange: (e) => setStoreAddress(e.target.value),
                placeholder: "매장 주소를 입력해주세요.",
              },
              {
                label: "매장 전화번호",
                value: storePhone,
                onChange: (e) => setStorePhone(e.target.value),
                placeholder: "매장 전화번호를 입력해주세요.",
              },
              {
                label: "사업자 등록 번호",
                value: businessNumber,
                onChange: (e) => setBusinessNumber(e.target.value),
                placeholder: "사업자 등록 번호를 입력해주세요.",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <p className="text-sm mb-1 text-left">{item.label}</p>
                <input
                  type="text"
                  value={item.value}
                  onChange={item.onChange}
                  placeholder={item.placeholder}
                  className="border h-[61px] py-[17.5px] px-[26.25px] rounded-[11px] w-full text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* 스케줄 탭 */}
        {activeTab === "schedule" && (
          <div className="flex flex-col gap-6 w-full">
            {/* 매장 운영 시간 */}
            <div className="flex items-center gap-2">
              <ClockCircleOutlined
                style={{ fontSize: "18px", color: "#87888c" }}
              />
              <p className="text-[16px] font-[600]">
                매장 운영 시간
                <span className="text-[#f74a4a]">*</span>
              </p>
              <div className="ml-auto">
                <TimeRangeSelect
                  start={operatingHours.start}
                  end={operatingHours.end}
                  onStartChange={(val) =>
                    setOperatingHours((prev) => ({ ...prev, start: val }))
                  }
                  onEndChange={(val) =>
                    setOperatingHours((prev) => ({ ...prev, end: val }))
                  }
                />
              </div>
            </div>

            {/* 파트 타임 나누기 */}
            <div className="w-full text-left">
              <div className="mb-1">
                <ToggleHeader
                  enabled={partTimeEnabled}
                  onToggle={() => setPartTimeEnabled(!partTimeEnabled)}
                  title="파트 타임 나누기"
                />
              </div>

              {partTimeEnabled && (
                <>
                  <p className="text-[12px] text-[#87888c] mb-0.5 ml-7">
                    *오픈/마감 등 자유롭게 스케줄 단위를 나눌 수 있어요.
                  </p>
                  <p className="text-[12px] text-[#F74A4A] mb-4 ml-7">
                    *근무 시간을 입력해주세요!
                  </p>

                  <div className="flex flex-col gap-3">
                    {partTimes.map((pt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 ml-7"
                      >
                        <span className="text-[14px] font-[500] min-w-[60px] shrink-0 text-left">
                          {getPartTimeLabel(idx)}
                        </span>
                        <TimeRangeSelect
                          start={pt.start}
                          end={pt.end}
                          onStartChange={(val) =>
                            handlePartTimeChange(idx, "start", val)
                          }
                          onEndChange={(val) =>
                            handlePartTimeChange(idx, "end", val)
                          }
                        />
                        <div
                          onClick={() => handleRemovePartTime(idx)}
                          className={`w-[22px] h-[22px] rounded-full bg-[#555] text-white flex items-center justify-center text-[10px] shrink-0 ${partTimes.length <= 1 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          ✕
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    onClick={handleAddPartTime}
                    className="flex items-center justify-center gap-1 w-full mt-4 py-2 text-[14px] text-[#87888c] cursor-pointer"
                  >
                    <PlusCircleOutlined /> 추가하기
                  </div>
                </>
              )}
            </div>

            {/* 브레이크타임 */}
            <div className="w-full text-left">
              <ToggleHeader
                enabled={breakTimeEnabled}
                onToggle={() => setBreakTimeEnabled(!breakTimeEnabled)}
                title="브레이크타임"
              >
                {breakTimeEnabled && (
                  <div className="ml-auto shrink-0">
                    <TimeRangeSelect
                      start={breakTime.start}
                      end={breakTime.end}
                      onStartChange={(val) =>
                        setBreakTime((prev) => ({ ...prev, start: val }))
                      }
                      onEndChange={(val) =>
                        setBreakTime((prev) => ({ ...prev, end: val }))
                      }
                    />
                  </div>
                )}
              </ToggleHeader>
              <p className="text-[12px] text-[#87888c] mt-2 ml-7">
                * 브레이크 타임이 있다면, 해당 구간은 급여 계산에서 제외해요.
              </p>
            </div>
          </div>
        )}

        {/* 하단 고정: 탭 + 버튼 */}
        <div className="absolute bottom-10 w-full px-[8px] flex flex-col items-center gap-[12px]">
          {/* 탭 토글 */}
          <div className="inline-flex rounded-full border-[1px] border-[#B3B3B3] overflow-hidden">
            <div
              onClick={() => setActiveTab("info")}
              className={`w-[80px] py-[15px] text-[14px] font-[500] text-center cursor-pointer transition-colors border-r-[1px] border-[#B3B3B3] ${
                activeTab === "info"
                  ? "bg-[#E6E6E6] text-black"
                  : "bg-white text-[#87888c]"
              }`}
            >
              정보
            </div>
            <div
              onClick={() => setActiveTab("schedule")}
              className={`w-[80px] py-[15px] text-[14px] font-[500] text-center cursor-pointer transition-colors ${
                activeTab === "schedule"
                  ? "bg-[#E6E6E6] text-black"
                  : "bg-white text-[#87888c]"
              }`}
            >
              스케줄
            </div>
          </div>

          {/* 입력 완료 버튼 */}
          <Button
            onClick={handleSubmit}
            className="!w-full h-[53px] text-[16px] font-[600] rounded-[11px] !bg-[#E7EAF3] !text-[#87888c]"
          >
            입력 완료
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StoreSettings;
