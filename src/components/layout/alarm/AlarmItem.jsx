import React from "react";


function AlarmItem({ icon, title, time, children }) {
    return (
        <div className="flex w-full px-4 py-3 gap-3">
            <div className="w-[40px] h-[40px]">{icon}</div>
                <div className="flex flex-col flex-1">
                <p className="text-[13px] text-gray-500 mb-[2px]">{title}</p>
                <div className="text-[14px] leading-[20px] text-gray-800">{children}</div>
                <p className="text-[12px] text-gray-400 mt-1">{time}</p>
            </div>
        </div>
    );
}
export default AlarmItem;