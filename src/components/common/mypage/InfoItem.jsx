import { useState } from "react";
import CopyIcon from "../../../assets/icons/CopyIcon";
import ArrowIcon from "../../../assets/icons/ArrowIcon";
import { useNavigate } from "react-router-dom";

function InfoItem({
  icon,
  title,
  content,
  isEdit,
  hasCopy,
  hasArrow,
  msg,
  nav,
  required,
  onChange,
  name,
  check,
}) {
  const [value, setValue] = useState(content);
  const [copied, setCopied] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChange && name) {
      onChange(name, newValue);
    }
    handleCheck(newValue);
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

  const handleCheck = (value) => {
    const c = check(value);
    setShowMsg(!c);
  };

  return (
    <div className="flex flex-row items-center justify-between w-full mt-2">
      <div className="flex flex-row items-center">
        {icon}
        <div className="flex flex-col ml-3 mt-2">
          <div className="flex flex-row gap-1">
            <p className="text-[14px] text-left font-[600] text-gray-400 mb-2">
              {title}
            </p>
            {required && (
              <span className="text-[16px] text-left font-[400] text-black">
                *
              </span>
            )}
          </div>
          <div className="flex items-center">
            {isEdit ? (
              <div>
                <input
                  className="text-[18px] text-left font-[600]"
                  value={value}
                  onChange={handleChange}
                  name={name}
                />
              </div>
            ) : (
              <div className="flex flex-row items-center">
                <input
                  className="w-min text-[18px] text-left font-[600] focus:outline-none"
                  type="text"
                  value={value}
                  size={value ? value.length : 1}
                  disabled={true}
                />
                {hasCopy && <CopyIcon onClick={handleCopy} />}
              </div>
            )}
            {copied && (
              <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-green-400 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
                복사 완료
              </div>
            )}
          </div>
          {isEdit ? (
            <div className="w-[290px] h-[12px] border-b border-gray-400 text-[10px] text-[#f74a4a] text-left">
              {showMsg ? msg : null}
            </div>
          ) : (
            <div className="w-full h-[12px] border-b border-[#f8fbfe] "></div>
          )}
        </div>
      </div>
      {hasArrow && (
        <ArrowIcon
          onClick={() => {
            navigate(nav);
          }}
        />
      )}
    </div>
  );
}

export default InfoItem;
