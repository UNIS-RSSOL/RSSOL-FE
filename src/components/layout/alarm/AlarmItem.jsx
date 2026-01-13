import React from "react";
import { useState, useEffect } from "react";
import GreenBtn from "../../common/GreenBtn.jsx";
import character from "../../../assets/images/EmpBtn.png";
import {
  acceptShiftSwap,
  approveShiftSwap,
  respondStaffRequest,
  approveStaffRequest,
} from "../../../services/common/AlarmService.js";

/**
 * 알람 번호
 * 1. 버튼 없는 일반 알림
 * 2. 거절, 수락 버튼 있는 알림
 * 3. 최종 승인 알림(미승인, 승인)
 */

function AlarmItem({
  alarmType,
  img,
  storename,
  time,
  children,
  id,
  status,
  approval,
}) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [isAccepted, setIsAccepted] = useState();

  useEffect(() => {
    if (alarmType === 2 && (status === "ACCEPTED" || status === "REJECTED")) {
      setIsDisabled(true);
      if (status === "ACCEPTED") setIsAccepted(true);
      else setIsAccepted(false);
    }
    if (
      alarmType === 3 &&
      (approval === "APPROVED" || approval === "REJECTED")
    ) {
      setIsDisabled(true);
      if (approval === "APPROVED") setIsAccepted(true);
      else setIsAccepted(false);
    }
  }, [status, isDisabled, approval]);

  //대타1차(ACCEPT/REJECT)
  const handleAcceptShiftSwap = async (requestId, action) => {
    try {
      const response = await acceptShiftSwap(requestId, action);
      setIsDisabled(true);
      return response;
    } catch (error) {
      console.error("대타 요청 수락 실패:", error);
    }
  };

  //대타최종승인(APPROVE or REJECT)
  const handleApproveShiftSwap = async (requestId, action) => {
    try {
      const response = await approveShiftSwap(requestId, action);
      setIsDisabled(true);
      return response;
    } catch (error) {
      console.error("대타 요청 최종 승인 실패:", error);
    }
  };

  //알바생 인력요청 수락/거절
  const handleAcceptStaffRequest = async (requestId, action) => {
    try {
      const response = await respondStaffRequest(requestId, action);
      setIsDisabled(true);
      return response;
    } catch (error) {
      console.error("알바생 인력 요청 수락/거절 실패:", error);
    }
  };

  //알바생 인력요청 최종 승인/미승인
  const handleApproveStaffRequest = async (requestId, action) => {
    try {
      const response = await approveStaffRequest(requestId, action);
      setIsDisabled(true);
      return response;
    } catch (error) {
      console.error("알바생 인력 요청 최종 승인/미승인 실패:", error);
    }
  };

  return (
    <div className="flex flex-row px-5 my-2 items-center gap-4">
      {!img || img === "" || img === null ? (
        <img src={character} alt="profile" className="size-[47px]" />
      ) : (
        <div className="size-[45px] rounded-full shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] flex-shrink-0">
          <img src={img} alt="profile" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex-1 flex flex-col items-start gap-1">
        <p className="flex items-center bg-[#fdfffe] border-[#32d1aa] border-[1px] rounded-[20px] shadow-[0_2px_4px_0_rgba(0,0,0,0.15)] font-[400] text-[12px]/[16px] px-3 h-[24px]">
          {storename}
        </p>
        <p className="text-[14px] font-[500] text-left">{children}</p>
        <span className="text-[10px] font-[400] text-[#87888c]">{time}</span>
        <div className="w-full flex justify-end items-center gap-2">
          {alarmType === 2 ? (
            <>
              <GreenBtn
                className={`rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px] ${isAccepted ? "bg-[#EDF0F7] text-[#87888c]" : ""}`}
                disabled={isDisabled}
                onClick={() => {
                  if (children.includes("대타")) {
                    handleAcceptShiftSwap(id, "REJECT");
                  } else {
                    handleAcceptStaffRequest(id, "REJECT");
                  }
                }}
              >
                거절
              </GreenBtn>
              <GreenBtn
                className={`rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px] ${isAccepted ? "" : "bg-[#EDF0F7] text-[#87888C]"}`}
                disabled={isDisabled}
                onClick={() => {
                  if (children.includes("대타")) {
                    handleAcceptShiftSwap(id, "ACCEPT");
                  } else {
                    handleAcceptStaffRequest(id, "ACCEPT");
                  }
                }}
              >
                수락
              </GreenBtn>
            </>
          ) : alarmType === 3 ? (
            <>
              <GreenBtn
                className={`rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px] ${isAccepted ? "bg-[#EDF0F7] text-[#87888C]" : ""}`}
                disabled={isDisabled}
                onClick={() => {
                  if (children.includes("대타")) {
                    handleApproveShiftSwap(id, "REJECT");
                  } else {
                    handleApproveStaffRequest(id, "REJECT");
                  }
                }}
              >
                미승인
              </GreenBtn>
              <GreenBtn
                className={`rounded-[10px] w-[64px] h-[32px] font-[500] text-[14px] ${isAccepted ? "" : "bg-[#EDF0F7] text-black"}`}
                disabled={isDisabled}
                onClick={() => {
                  if (children.includes("대타")) {
                    handleApproveShiftSwap(id, "APPROVE");
                  } else {
                    handleApproveStaffRequest(id, "APPROVE");
                  }
                }}
              >
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
