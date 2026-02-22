import { CheckCircleFilled } from "@ant-design/icons";

function ToggleHeader({ enabled, onToggle, title, children }) {
  return (
    <div className="flex items-center gap-2">
      <div onClick={onToggle} className="cursor-pointer shrink-0">
        <CheckCircleFilled
          style={{ fontSize: "20px", color: enabled ? "#3370FF" : "#D9D9D9" }}
        />
      </div>
      <p className="text-[16px] font-[600] whitespace-nowrap shrink-0">
        {title}
      </p>
      {children}
    </div>
  );
}

export default ToggleHeader;
