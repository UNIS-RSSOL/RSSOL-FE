import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  onboardingOwner,
  onboardingStaff,
} from "../../services/OnboardingService.js";
import {
  CaretDownFilled,
  ClockCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Button from "../../components/common/Button.jsx";
import BackButton from "../../components/common/BackButton.jsx";
import OnboardingBtn from "../../components/login/OnboardingBtn.jsx";
import TimeRangeSelect from "../../components/common/TimeRangeSelect.jsx";
import ToggleHeader from "../../components/common/ToggleHeader.jsx";

// 은행 드롭다운 목록
const bankItems = [
  { label: "국민은행", key: 1 },
  { label: "신한은행", key: 2 },
  { label: "우리은행", key: 3 },
  { label: "하나은행", key: 4 },
  { label: "농협은행", key: 5 },
  { label: "기업은행", key: 6 },
  { label: "카카오은행", key: 7 },
  { label: "토스은행", key: 8 },
];

// 파트 타임 라벨
const getPartTimeLabel = (index) => {
  if (index === 0) return "오픈조";
  return `구간 ${index + 1}`;
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    businessNumber: "",
    storeCode: "",
    bankId: 0,
    account: "",
    hireDate: "",
  });
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({
    storePhone: "",
    businessNumber: "",
    account: "",
  });

  // Step 3: 매장 운영 정보
  const [operatingHours, setOperatingHours] = useState({
    start: "09:00",
    end: "22:00",
  });
  const [partTimes, setPartTimes] = useState([
    { start: "09:00", end: "14:00" },
    { start: "14:00", end: "22:00" },
  ]);
  const [partTimeEnabled, setPartTimeEnabled] = useState(true);
  const [breakTimeEnabled, setBreakTimeEnabled] = useState(true);
  const [breakTime, setBreakTime] = useState({
    start: "14:00",
    end: "15:00",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Validation 체크
    if (name === "storePhone") {
      if (value.length > 0 && value.length <= 7) {
        setErrors((prev) => ({
          ...prev,
          storePhone: "*최소 8자리부터 입력가능합니다",
        }));
      } else {
        setErrors((prev) => ({ ...prev, storePhone: "" }));
      }
    } else if (name === "businessNumber") {
      if (value.length > 0 && value.length !== 10) {
        setErrors((prev) => ({
          ...prev,
          businessNumber: "*총 10자리를 입력해주세요.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, businessNumber: "" }));
      }
    } else if (name === "account") {
      if (value.length > 0 && !/^\d+$/.test(value)) {
        setErrors((prev) => ({
          ...prev,
          account: "*계좌번호는 숫자만 입력 가능합니다.",
        }));
      } else {
        setErrors((prev) => ({ ...prev, account: "" }));
      }
    }
  };

  const handleNext = async () => {
    if (step === 1 && !role) {
      alert("역할을 선택해주세요!");
      return;
    }

    if (step === 2) {
      if (role === "owner") {
        const {
          storeName,
          storeAddress,
          storePhone,
          businessNumber,
          hireDate,
        } = formData;
        if (
          !storeName ||
          !storeAddress ||
          !storePhone ||
          !businessNumber ||
          !hireDate
        ) {
          alert("모든 정보를 입력해주세요.");
          return;
        }

        // Step 3 매장 운영 정보 입력으로 이동
        setStep(3);
        return;
      } else {
        const { storeCode, bankId, account, hireDate } = formData;
        if (!storeCode || !bankId || bankId === 0 || !account || !hireDate) {
          alert("모든 정보를 입력해주세요.");
          return;
        }

        // 계좌번호 숫자 검증
        if (!/^\d+$/.test(account)) {
          setError("계좌번호는 숫자만 입력 가능합니다.");
          return;
        }

        // TODO: API 연결 시 아래 3줄(navigate~return) 제거 후 주석 블록 해제
        navigate("/employee");
        return;
        /* ── 알바생 온보딩 API (연결 시 주석 해제) ──
        setIsLoading(true);
        setError("");
        try {
          await onboardingStaff(storeCode, bankId, account, hireDate);
          navigate("/employee");
        } catch (err) {
          console.error("온보딩(알바생) 실패:", err);
          setError(err.response?.data?.message || "온보딩 등록에 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
        return;
        ── */
      }
    }

    if (step === 3) {
      // TODO: API 연결 시 아래 3줄(navigate~return) 제거 후 주석 블록 해제
      navigate("/owner");
      return;
      /* ── 사장님 온보딩 API (연결 시 주석 해제) ──
      setIsLoading(true);
      setError("");
      try {
        await onboardingOwner(
          formData.storeName,
          formData.storeAddress,
          formData.storePhone,
          formData.businessNumber,
          formData.hireDate,
        );
        // TODO: 매장 운영 정보 API 호출 (operatingHours, partTimes, breakTime)
        navigate("/owner");
      } catch (err) {
        console.error("온보딩(사장님) 실패:", err);
        setError(err.response?.data?.message || "온보딩 등록에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
      return;
      ── */
    }

    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/login");
      return;
    }
    setStep(step - 1);
  };

  // Step 3 handlers
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

  // 완료 조건 체크
  const isStepComplete = () => {
    if (step === 1) {
      return role !== null;
    } else if (step === 2) {
      if (role === "owner") {
        const {
          storeName,
          storeAddress,
          storePhone,
          businessNumber,
          hireDate,
        } = formData;
        return (
          storeName &&
          storeAddress &&
          storePhone &&
          storePhone.length >= 8 &&
          businessNumber &&
          businessNumber.length === 10 &&
          hireDate
        );
      } else if (role === "employee") {
        const { storeCode, bankId, account, hireDate } = formData;
        return (
          storeCode &&
          bankId &&
          bankId !== 0 &&
          account &&
          /^\d+$/.test(account) &&
          hireDate
        );
      }
    } else if (step === 3) {
      return (
        operatingHours.start &&
        operatingHours.end &&
        partTimes.length > 0 &&
        partTimes.every((pt) => pt.start && pt.end)
      );
    }
    return false;
  };

  // 버튼 텍스트
  const getButtonText = () => {
    if (step === 1) return "선택 완료";
    if (step === 2 && role === "owner") return "다음";
    return "입력 완료";
  };

  return (
    <div className="relative w-full min-h-screen bg-white flex flex-col items-center py-10 px-4 font-Pretendard overflow-x-hidden">
      {/* 상단 이전 버튼 */}
      <div className="absolute top-10 left-5 flex justify-start w-full">
        <BackButton onClick={handleBack} />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="w-full max-w-[393px] mt-8 flex flex-col items-center px-[8px] pb-[80px]">
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* --- STEP 1: 역할 선택 --- */}
        {step === 1 && (
          <>
            <h2 className="text-[30px] font-[700] mb-2 w-full text-left">
              회원님
            </h2>
            <p className="text-[20px] font-[400] mb-20 w-full text-left">
              계정 유형을 선택해주세요
            </p>

            <div className="flex flex-col gap-7 w-full">
              <OnboardingBtn
                value="owner"
                role={role}
                onClick={(selectedRole) => setRole(selectedRole)}
              >
                <div className="flex flex-col items-start">
                  <p className="text-[20px] font-[400] text-left">사장님</p>
                  <p className="text-[14px] font-[400] text-left">
                    매장 및 직원 관리를 할 수 있어요!
                  </p>
                </div>
              </OnboardingBtn>

              <OnboardingBtn
                value="employee"
                role={role}
                onClick={(selectedRole) => setRole(selectedRole)}
              >
                <div className="flex flex-col items-start">
                  <p className="text-[20px] font-[400] text-left">알바생</p>
                  <p className="text-[14px] font-[400] text-left">
                    월급 확인과 대타 신청을 할 수 있어요!
                  </p>
                </div>
              </OnboardingBtn>
            </div>
          </>
        )}

        {/* --- STEP 2: 사장님 매장 정보 --- */}
        {step === 2 && role === "owner" && (
          <>
            <h2 className="text-3xl font-bold mb-2 w-full text-left">회원님</h2>
            <p className="text-base mb-6 w-full text-left">
              매장 정보를 입력해주세요
            </p>

            <div className="flex flex-col gap-[17.5px] w-full">
              {[
                {
                  label: "매장 이름",
                  name: "storeName",
                  placeholder: "매장 이름을 입력해주세요.",
                },
                {
                  label: "매장 주소",
                  name: "storeAddress",
                  placeholder: "매장 주소를 입력해주세요.",
                },
                {
                  label: "매장 전화번호",
                  name: "storePhone",
                  placeholder: "매장 전화번호를 입력해주세요.",
                },
                {
                  label: "사업자 등록 번호",
                  name: "businessNumber",
                  placeholder: "사업자 등록 번호를 입력해주세요.",
                },
                {
                  label: "입사 날짜",
                  name: "hireDate",
                  placeholder: "0000.00.00",
                },
              ].map((item) => (
                <div key={item.name} className="flex flex-col">
                  <p className="text-sm mb-1 text-left">{item.label}</p>
                  <input
                    name={item.name}
                    type="text"
                    value={formData[item.name]}
                    onChange={handleChange}
                    placeholder={item.placeholder}
                    className="border h-[61px] py-[17.5px] px-[26.25px] rounded-[11px] w-full text-sm"
                  />
                  {item.name === "storePhone" && errors.storePhone && (
                    <p className="text-[10px] text-[#f74a4a] text-left mt-1">
                      {errors.storePhone}
                    </p>
                  )}
                  {item.name === "businessNumber" && errors.businessNumber && (
                    <p className="text-[10px] text-[#f74a4a] text-left mt-1">
                      {errors.businessNumber}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- STEP 2: 알바생 정보 --- */}
        {step === 2 && role === "employee" && (
          <>
            <h2 className="text-3xl font-bold mb-2 w-full text-left">회원님</h2>
            <p className="text-base mb-6 w-full text-left">
              매장 정보, 급여 계좌 정보를 등록해주세요
            </p>

            <div className="flex flex-col gap-4 w-full">
              <div>
                <p className="text-sm mb-1 text-left">매장 등록번호</p>
                <input
                  name="storeCode"
                  value={formData.storeCode}
                  onChange={handleChange}
                  placeholder="매장 등록번호"
                  className="border p-2 rounded-lg w-full"
                />
              </div>

              <div>
                <p className="text-sm mb-1 text-left">입사날짜</p>
                <input
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="border p-2 rounded-lg w-full"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex gap-2 w-full">
                  <div className="flex-[3] relative">
                    <p className="text-sm mb-1 text-left">은행</p>
                    <div
                      className={`flex w-full items-center justify-between py-2 px-3 bg-white border rounded-lg cursor-pointer ${
                        bankDropdownOpen
                          ? "border-b-0 rounded-b-none"
                          : "border"
                      }`}
                      onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                    >
                      <span className="text-sm">
                        {formData.bankId === 0
                          ? "은행 선택"
                          : bankItems.find(
                              (item) => item.key === formData.bankId,
                            )?.label || "은행 선택"}
                      </span>
                      <CaretDownFilled
                        style={{
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      />
                    </div>
                    {bankDropdownOpen && (
                      <div className="absolute left-0 top-full mt-0 w-full border border-t-0 rounded-b-lg overflow-hidden z-10 bg-white">
                        {bankItems.map((item) => (
                          <div
                            key={item.key}
                            className="flex items-center justify-start w-full py-2 px-3 bg-white hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                bankId: item.key,
                              }));
                              setBankDropdownOpen(false);
                            }}
                          >
                            <span className="text-sm">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-[7]">
                    <p className="text-sm mb-1 text-left">계좌번호</p>
                    <input
                      name="account"
                      type="text"
                      inputMode="numeric"
                      value={formData.account}
                      onChange={handleChange}
                      placeholder="계좌번호를 입력해주세요"
                      className="border p-2 rounded-lg w-full"
                    />
                  </div>
                </div>
                {errors.account && (
                  <p className="text-[10px] text-[#f74a4a] text-left mt-1">
                    {errors.account}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* --- STEP 3: 사장님 매장 운영 정보 --- */}
        {step === 3 && role === "owner" && (
          <>
            <h2 className="text-[30px] font-[700] mb-2 w-full text-left">
              {formData.storeName}
            </h2>
            <p className="text-[20px] font-[400] mb-8 w-full text-left">
              매장 정보를 입력해주세요.
            </p>

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
          </>
        )}

        {/* --- Bottom Fixed Button --- */}
        <div className="absolute bottom-10 w-full px-[8px]">
          <Button
            onClick={handleNext}
            className={`!w-full h-[53px] text-[16px] font-[600] rounded-[11px] ${isStepComplete() ? "!bg-[#3370FF] text-white" : "!bg-[#E7EAF3] !text-[#87888c] !cursor-not-allowed hover:!opacity-100"}`}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}
