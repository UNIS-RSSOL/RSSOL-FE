import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const [step, setStep] = useState(1); // 현재 단계
  const [role, setRole] = useState(null); // 'owner' or 'employee'
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
  const [selected, setSelected] = useState(null);

  const handleSelect = (value) => {
    setSelected(value);
  };
  
  const navigate = useNavigate();

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
      // form 유효성 검사
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
    }
    if (step < 2) setStep(step + 1);
    else {
      // 완료 시 페이지 이동
      navigate(role === "owner" ? "/ownerpage" : "/employeepage");
    }
  };

  const handleBack = () => setStep(step - 1);

  return (
    <div className=" flex flex-col divide-y-8 divide-[#E7EAF3]">
      <div className="flex flex-col items-center">
        <div className="relative min-h-screen bg-[#F8FBFE] flex flex-col items-center justify-center p-6 font-Pretendard">
          <div className="mt-10 flex gap-4">
            {step > 0 && (
              <button
                onClick={handleBack}
                className="absolute top-4 left-0 px-4 py-2 bg-gray-300 rounded-lg"
              >
                이전
              </button>
            )}
          </div>
          {step === 1 && (
            <>
              <div className="absolute top-40 left-2 w-full text-left self-start -mt-10">
                <p className="text-3xl font-bold mb-3">회원님</p>
                <p className="text-lg text-black mb-6">계정 유형을 선택해주세요</p>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setRole("owner")}
                  className={`px-6 py-3 rounded-xl border ${
                    role === "owner" ? "bg-blue-500 text-black" : "bg-white"
                  }`}
                >
                  <p className="text-base font-bold">사장님</p>
                  <p className="text-sm">매장 및 직원 관리를 할 수 있어요!</p>
                </button>
                <button
                  onClick={() => setRole("employee")}
                  className={`px-6 py-3 rounded-xl border ${
                    role === "employee" ? "bg-[#68E194] text-black" : "bg-white"
                  }`}
                >
                  <p className="text-base font-bold">알바생</p>
                  <p className="text-sm">월급 확인과 대타 신청을 할 수 있어요!</p>
                </button>
              </div>
            </>
          )}

          {step === 2 && role === "owner" && (
            <>
              <div className="absolute top-40 left-2 w-full text-left self-start -mt-10">
                <p className="text-3xl font-bold mb-3">회원님</p>
                <p className="text-base text-black mb-6">매장 정보를 입력해주세요</p>
              </div>
              <div className="flex flex-col gap-3 w-72">
                <p className="text-left text-sm text-black mb-0">매장 이름</p>
                <input
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="매장 이름을 입력해주세요."
                  className="border p-2 rounded-lg"
                />
                <p className="text-left text-sm text-black mb-0">매장 주소</p>
                <input
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleChange}
                  placeholder="매장 주소를 입력해주세요."
                  className="border p-2 rounded-lg"
                />
                <p className="text-left text-sm text-black mb-0">매장 전화번호</p>
                <input
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleChange}
                  placeholder="매장 전화번호를 입력해주세요."
                  className="border p-2 rounded-lg"
                />
                <p className="text-left text-sm text-black mb-0">사업자 등록 번호</p>
                <input
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  placeholder="사업자 등록 번호를 입력해주세요."
                  className="border p-2 rounded-lg"
                />
              </div>
            </>
          )}

          {step === 2 && role === "employee" && (
            <>
              <div className="absolute top-40 left-2 w-full text-left self-start -mt-10">
                <p className="text-3xl font-bold mb-3">회원님</p>
                <p className="text-base text-black mb-6">매장 정보, 급여 계좌 정보를 등록해주세요</p>
              </div>
              <div className="flex flex-col gap-3 w-72">
                <p className="text-left text-sm text-black mb-0">매장 등록번호</p>
                <input
                  name="storeCode"
                  value={formData.storeCode}
                  onChange={handleChange}
                  placeholder="매장 등록번호"
                  className="border p-2 rounded-lg"
                />
                <p className="text-left text-sm text-black mb-0">입사 날짜</p>
                <input
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="border p-2 rounded-lg"
                />
                <p className="text-left text-sm text-black mb-0">은행</p>
                <input
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  placeholder="은행명"
                  className="border p-2 rounded-lg"
                />
                <p className="text-left text-sm text-black mb-0">계좌번호</p>
                <input
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  placeholder="계좌번호"
                  className="border p-2 rounded-lg"
                />
              </div>
            </>
          )}

          {/* 하단 버튼 영역 */}
          <div className="mt-10 flex gap-4">
            <button
              onClick={handleNext}
              className="absolute w-full bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-500 text-black rounded-lg"
            >
              {step === 2 ? "입력 완료" : "선택 완료"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
