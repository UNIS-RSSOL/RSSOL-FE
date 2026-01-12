import React from "react";
import { useState } from "react";
import GreenBtn from "../../common/GreenBtn.jsx";

/**
 * 알람 번호
 * 1. 버튼 없는 일반 알림
 * 2. 거절, 수락 버튼 있는 알림
 * 3. 최종 승인 알림(미승인, 승인)
 */

function AlarmItem({ alarmType, storename, time, children }) {
  return (
    <div className="flex flex-row px-5 my-2 items-center gap-4">
      <div className="size-[45px] rounded-full shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] flex-shrink-0"></div>
      <div className="flex-1 flex flex-col items-start gap-1">
        <p className="flex items-center bg-[#fdfffe] border-[#32d1aa] border-[1px] rounded-[20px] shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] font-[400] text-[12px]/[16px] px-3 h-[24px]">
          {storename}
        </p>
        <p className="text-[14px] font-[500] text-left">{children}</p>
        <span className="text-[10px] font-[400] text-[#87888c]">{time}</span>
        <div className="w-full flex justify-end items-center gap-2">
          {alarmType === 2 ? (
            <>
              <GreenBtn className="rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px]">
                거절
              </GreenBtn>
              <GreenBtn className="rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px]">
                수락
              </GreenBtn>
            </>
          ) : alarmType === 3 ? (
            <>
              <GreenBtn className="rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px]">
                미승인
              </GreenBtn>
              <GreenBtn className="rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px]">
                승인
              </GreenBtn>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default AlarmItem;
