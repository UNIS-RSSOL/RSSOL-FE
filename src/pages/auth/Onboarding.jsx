import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  onboardingOwner,
  onboardingStaff,
} from "../../services/authService.js";
import { CaretDownFilled } from "@ant-design/icons";
import character4 from "../../assets/images/character4.png";
import character2 from "../../assets/images/character2.png";

const ONBOARDING_ROLE_KEY = "onboardingRole";
const ONBOARDING_DATA_KEY = "onboardingData";

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

  const navigate = useNavigate();

  // 컴포넌트 마운트 시 localStorage에서 데이터 복원
  useEffect(() => {
    const savedRole = localStorage.getItem(ONBOARDING_ROLE_KEY);
    const savedData = localStorage.getItem(ONBOARDING_DATA_KEY);

    if (savedRole) {
      setRole(savedRole);
    }

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("온보딩 데이터 파싱 실패:", error);
      }
    }
  }, []);

  // localStorage
  // role이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (role) {
      localStorage.setItem(ONBOARDING_ROLE_KEY, role);
    }
  }, [role]);

  // formData가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(formData));
  }, [formData]);

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
        const { storeName, storeAddress, storePhone, businessNumber, hireDate } =
          formData;
        if (!storeName || !storeAddress || !storePhone || !businessNumber || !hireDate) {
          alert("모든 정보를 입력해주세요.");
          return;
        }

        // 사장님 온보딩 API 호출
        setIsLoading(true);
        setError("");
        try {
          await onboardingOwner(
            storeName,
            storeAddress,
            storePhone,
            businessNumber,
            hireDate,
          );
          // 성공 시 사장님 홈으로 이동
          navigate("/owner");
        } catch (err) {
          console.error("온보딩(사장님) 실패:", err);
          setError(
            err.response?.data?.message || "온보딩 등록에 실패했습니다.",
          );
        } finally {
          setIsLoading(false);
        }
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

        // 알바생 온보딩 API 호출
        setIsLoading(true);
        setError("");
        try {
          await onboardingStaff(storeCode, bankId, account, hireDate);
          // 성공 시 알바생 홈으로 이동
          navigate("/employee");
        } catch (err) {
          console.error("온보딩(알바생) 실패:", err);
          setError(
            err.response?.data?.message || "온보딩 등록에 실패했습니다.",
          );
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // 최종 데이터 localStorage에 저장
      localStorage.setItem(ONBOARDING_ROLE_KEY, role);
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(formData));
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

  // 완료 조건 체크
  const isStepComplete = () => {
    if (step === 1) {
      return role !== null;
    } else if (step === 2) {
      if (role === "owner") {
        const { storeName, storeAddress, storePhone, businessNumber, hireDate } =
          formData;
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
    }
    return false;
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-10 px-4 font-Pretendard">
      {/* 상단 이전 버튼 */}
      <button
        onClick={handleBack}
        className="self-start text-sm px-4 py-2 bg-gray-200 rounded-lg"
      >
        이전
      </button>

      {/* 컨텐츠 영역 */}
      <div className="w-full max-w-[360px] mt-8 flex flex-col items-center px-4">
        {error && (
          <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* --- STEP CONTENT --- */}
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold mb-2 w-full text-left">회원님</h2>
            <p className="text-base mb-6 w-full text-left">
              계정 유형을 선택해주세요
            </p>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => setRole("owner")}
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  role === "owner" ? "bg-blue-500 text-black" : "bg-white"
                }`}
              >
                <img
                  src={character4}
                  alt="사장님 캐릭터"
                  className="w-16 h-16 object-contain"
                />
                <div className="flex flex-col items-start">
                  <p className="text-base font-bold text-left">사장님</p>
                  <p className="text-sm text-left">
                    매장 및 직원 관리를 할 수 있어요!
                  </p>
                </div>
              </button>

              <button
                onClick={() => setRole("employee")}
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  role === "employee" ? "bg-[#68E194] text-black" : "bg-white"
                }`}
              >
                <img
                  src={character2}
                  alt="알바생 캐릭터"
                  className="w-16 h-16 object-contain"
                />
                <div className="flex flex-col items-start">
                  <p className="text-base font-bold text-left">알바생</p>
                  <p className="text-sm text-left">
                    월급 확인과 대타 신청을 할 수 있어요!
                  </p>
                </div>
              </button>
            </div>
          </>
        )}

        {/* STEP 2 - Owner */}
        {step === 2 && role === "owner" && (
          <>
            <h2 className="text-3xl font-bold mb-2 w-full text-left">회원님</h2>
            <p className="text-base mb-6 w-full text-left">
              매장 정보를 입력해주세요
            </p>

            <div className="flex flex-col gap-4 w-full">
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
                  label: "입사날짜",
                  name: "hireDate",
                  placeholder: "입사날짜를 선택해주세요.",
                  type: "date",
                },
              ].map((item) => (
                <div key={item.name} className="flex flex-col">
                  <p className="text-sm mb-1 text-left">{item.label}</p>
                  <input
                    name={item.name}
                    type={item.type || "text"}
                    value={formData[item.name]}
                    onChange={handleChange}
                    placeholder={item.placeholder}
                    className="border p-2 rounded-lg w-full"
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

        {/* STEP 2 - Employee */}
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
                          : bankItems.find((item) => item.key === formData.bankId)
                              ?.label || "은행 선택"}
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

        {/* --- Bottom Fixed Button --- */}
        <div className="w-full sticky bottom-0 bg-white pt-6 pb-4">
          <button
            onClick={handleNext}
            className="w-full py-3 bg-blue-500 text-black rounded-lg"
          >
            {step === 2 ? "입력 완료" : "선택 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
