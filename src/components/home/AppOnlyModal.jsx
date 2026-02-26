function AppOnlyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-[16px] p-[24px] w-[300px] text-center">
        <p className="text-[18px] font-[600] mb-[12px]">앱 전용 기능입니다</p>
        <p className="text-[14px] text-[#87888c] mb-[20px]">
          출퇴근 기능은 알솔 앱에서만 사용할 수 있어요.
        </p>
        <div
          className="inline-flex items-center justify-center w-full h-[44px] rounded-[10px] bg-[#3370FF] text-white text-[14px] font-[500] cursor-pointer"
          onClick={onClose}
        >
          확인
        </div>
      </div>
    </div>
  );
}

export default AppOnlyModal;
