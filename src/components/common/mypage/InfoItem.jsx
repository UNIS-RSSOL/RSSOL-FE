import { useState, useEffect } from "react";
import CopyIcon from "../../../assets/icons/CopyIcon.jsx";
import { CaretDownFilled } from "@ant-design/icons";
import Modal from "../Modal.jsx";

function InfoItem({ data, isEdit = false, onUpdate }) {
  const [value, setValue] = useState(data.content);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedKey, setSelectedKey] = useState(data.id);

  useEffect(() => {
    setValue(data.content);
  }, [data.content]);

  //은행 드롭다운
  const items = [
    {
      label: "국민은행",
      key: 1,
    },
    {
      label: "신한은행",
      key: 2,
    },
    {
      label: "우리은행",
      key: 3,
    },
    {
      label: "하나은행",
      key: 4,
    },
    {
      label: "농협은행",
      key: 5,
    },
    {
      label: "기업은행",
      key: 6,
    },
    {
      label: "카카오은행",
      key: 7,
    },
    {
      label: "토스은행",
      key: 8,
    },
  ];
  const DropDown = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
      <div className="relative">
        <div
          className={`flex w-[70px] items-center justify-center py-[2px] bg-white gap-1 cursor-pointer 
            ${
              dropdownOpen
                ? "border border-b-[#87888c] rounded-t-[12px]"
                : "border rounded-full"
            }`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span className="text-[12px] font-[400]">
            {items.find((item) => item.key === selectedKey)?.label}
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
        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-0 w-[70px] border border-t-0 rounded-b-[12px] overflow-hidden z-10">
            {items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-center w-full py-[2px] bg-white hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedKey(item.key);
                  onUpdate(data.title, value, item.key);
                  setDropdownOpen(false);
                }}
              >
                <span className="text-[12px] font-[400]">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (data.check) {
      const isValid = data.check(newValue);
      setError(isValid ? "" : `*${data.msg}`);
    }
    if (onUpdate) {
      if (data.title === "은행 계좌번호")
        onUpdate(data.title, newValue, selectedKey);
      else onUpdate(data.title, newValue);
    }
  };

  return (
    <div>
      <div className="flex flex-row w-full items-center gap-2">
        <div className="flex flex-shrink-0 items-center justify-center size-[40px]">
          {data.icon}
        </div>
        <div className="flex flex-col w-full items-start gap-2">
          <p className="text-[14px] font-[600] text-[#87888c] text-left">
            {data.title}
          </p>
          {(() => {
            if (data.title === "매장 등록 코드") {
              return (
                <div className="flex flex-row items-center">
                  <p className="text-black text-[18px] font-[600]">
                    {data.content}
                  </p>
                  <CopyIcon className="mx-2" onClick={handleCopy} />
                </div>
              );
            }
            if (data.title === "은행 계좌번호") {
              return isEdit ? (
                <div className="flex flex-row items-center gap-2">
                  <DropDown />
                  <input
                    className="text-black text-[18px] font-[600]"
                    value={value}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <div className="flex flex-row items-center gap-2">
                  <p className="text-black text-[18px] font-[600]">
                    {`${items[selectedKey - 1].label} ${data.content}`}
                  </p>
                </div>
              );
            } else {
              return (
                <input
                  className="text-black text-[18px] font-[600]"
                  value={value}
                  disabled={!isEdit}
                  onChange={handleChange}
                />
              );
            }
          })()}
        </div>
      </div>
      {isEdit && data.title !== "매장 등록 코드" ? (
        <div className="h-[12px] border-b border-[#87888c] ml-11 text-[10px] font-[400] text-[#f74a7a] text-left">
          {error}
        </div>
      ) : (
        <div className="h-[12px]  ml-11"></div>
      )}
      {copied && (
        <Modal onClose={setCopied} xx={false}>
          <p className="text-[16px] font-[400]">복사 완료되었습니다.</p>
        </Modal>
      )}
    </div>
  );
}

export default InfoItem;
