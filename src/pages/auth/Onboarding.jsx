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
        <div className="min-h-screen bg-[#F8FBFE] flex flex-col items-center justify-center p-6 font-Pretendard">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold mb-6">회원님</h1>
              <p className="text-sm text-gray-500 mb-6">계정 유형을 선택해주세요</p>
              <div className="flex gap-6">
                <button
                  onClick={() => setRole("owner")}
                  className={`px-6 py-3 rounded-xl border ${
                    role === "owner" ? "bg-blue-500 text-white" : "bg-white"
                  }`}
                >
                  사장님
                </button>
                <button
                  onClick={() => setRole("employee")}
                  className={`px-6 py-3 rounded-xl border ${
                    role === "employee" ? "bg-blue-500 text-white" : "bg-white"
                  }`}
                >
                  알바생
                </button>
              </div>
            </>
          )}

          {step === 2 && role === "owner" && (
            <>
              <h1 className="text-2xl font-bold mb-6">🏪 매장 정보 입력</h1>
              <div className="flex flex-col gap-3 w-72">
                <input
                  name="storeName"
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="매장 이름"
                  className="border p-2 rounded-lg"
                />
                <input
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleChange}
                  placeholder="매장 주소"
                  className="border p-2 rounded-lg"
                />
                <input
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleChange}
                  placeholder="매장 전화번호"
                  className="border p-2 rounded-lg"
                />
                <input
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  placeholder="사업자 등록 번호"
                  className="border p-2 rounded-lg"
                />
              </div>
            </>
          )}

          {step === 2 && role === "employee" && (
            <>
              <h1 className="text-2xl font-bold mb-6">👷 근무 정보 입력</h1>
              <div className="flex flex-col gap-3 w-72">
                <input
                  name="storeCode"
                  value={formData.storeCode}
                  onChange={handleChange}
                  placeholder="매장 등록번호"
                  className="border p-2 rounded-lg"
                />
                <input
                  name="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="border p-2 rounded-lg"
                />
                <input
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  placeholder="은행명"
                  className="border p-2 rounded-lg"
                />
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
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-gray-300 rounded-lg"
              >
                이전
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg"
            >
              {step === 2 ? "완료" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
