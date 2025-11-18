import React from "react";

function AlarmItem({ icon, title, time, children }) {
    return (
        <div className="flex w-full px-4 py-3 gap-3">
            <div className="w-[40px] h-[40px]">{icon}</div>

            <div className="flex flex-col flex-1">
                {/* title 박스 */}
                <p className="text-left text-[13px] text-black mb-[10px]">
                    <span className="bg-white border-[1.5px] border-[#68E194] rounded-[10px] px-2 py-[2px] shadow-sm">
                        {title}
                    </span>
                </p>

                {/* 내용 */}
                <div className="text-left font-medium text-[14px] leading-[20px] text-black">
                    {children}
                    <p className="text-[12px] text-gray-400 mt-1">{time}</p>
                </div>
            </div>
        </div>
    );
}

export default AlarmItem;
