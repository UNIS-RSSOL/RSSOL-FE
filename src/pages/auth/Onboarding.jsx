import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ONBOARDING_ROLE_KEY = "onboardingRole";
const ONBOARDING_DATA_KEY = "onboardingData";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [formData, setFormData] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    businessNumber: "",
    storeCode: "",
    joinDate: "",
    bank: "",
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
  };

  const handleNext = () => {
    if (step === 1 && !role) {
      alert("역할을 선택해주세요!");
      return;
    }

    if (step === 2) {
      if (role === "owner") {
        const { storeName, storeAddress, storePhone, businessNumber } = formData;
        if (!storeName || !storeAddress || !storePhone || !businessNumber) {
          alert("모든 정보를 입력해주세요.");
          return;
        }
      } else {
        const { storeCode, joinDate, bank, account } = formData;
        if (!storeCode || !joinDate || !bank || !account) {
          alert("모든 정보를 입력해주세요.");
          return;
        }
      }
      
      // 최종 데이터 localStorage에 저장
      localStorage.setItem(ONBOARDING_ROLE_KEY, role);
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(formData));
    }

    if (step < 2) setStep(step + 1);
    else navigate(role === "owner" ? "/owner" : "/employee");
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/login");
      return;
    }
    setStep(step - 1);
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
  
        {/* --- STEP CONTENT --- */}
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold mb-2 w-full text-left">회원님</h2>
            <p className="text-base mb-6 w-full text-left">계정 유형을 선택해주세요</p>
  
            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => setRole("owner")}
                className={`p-4 rounded-xl border ${
                  role === "owner" ? "bg-blue-500 text-black" : "bg-white"
                }`}
              >
                <p className="text-base font-bold text-left">사장님</p>
                <p className="text-sm text-left">매장 및 직원 관리를 할 수 있어요!</p>
              </button>
  
              <button
                onClick={() => setRole("employee")}
                className={`p-4 rounded-xl border ${
                  role === "employee" ? "bg-[#68E194] text-black" : "bg-white"
                }`}
              >
                <p className="text-base font-bold text-left">알바생</p>
                <p className="text-sm text-left">월급 확인과 대타 신청을 할 수 있어요!</p>
              </button>
            </div>
          </>
        )}
  
        {/* STEP 2 - Owner */}
        {step === 2 && role === "owner" && (
          <>
            <h2 className="text-3xl font-bold mb-2 w-full text-left">회원님</h2>
            <p className="text-base mb-6 w-full text-left">매장 정보를 입력해주세요</p>
  
            <div className="flex flex-col gap-4 w-full">
              {[
                { label: "매장 이름", name: "storeName", placeholder: "매장 이름을 입력해주세요." },
                { label: "매장 주소", name: "storeAddress", placeholder: "매장 주소를 입력해주세요." },
                { label: "매장 전화번호", name: "storePhone", placeholder: "매장 전화번호를 입력해주세요." },
                { label: "사업자 등록 번호", name: "businessNumber", placeholder: "사업자 등록 번호를 입력해주세요." },
              ].map((item) => (
                <div key={item.name} className="flex flex-col">
                  <p className="text-sm mb-1 text-left">{item.label}</p>
                  <input
                    name={item.name}
                    value={formData[item.name]}
                    onChange={handleChange}
                    placeholder={item.placeholder}
                    className="border p-2 rounded-lg w-full"
                  />
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
                <p className="text-sm mb-1 text-left">입사 날짜</p>
                <input
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="border p-2 rounded-lg w-full"
                />
              </div>
  
              <div>
                <p className="text-sm mb-1 text-left">은행</p>
                <input
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  placeholder="은행명"
                  className="border p-2 rounded-lg w-full"
                />
              </div>
  
              <div>
                <p className="text-sm mb-1 text-left">계좌번호</p>
                <input
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  placeholder="계좌번호"
                  className="border p-2 rounded-lg w-full"
                />
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