import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import TopBar from "../../../components/layout/alarm/TopBar";
import AlarmItem from "../../../components/layout/alarm/AlarmItem";
import ActionButtons from "../../../components/layout/alarm/ActionButtons";

function AlarmHomeEmp() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");

  return (
    <div className="w-full h-full bg-[#F8FBFE] overflow-y-auto">
      <TopBar title="알림" onBack={() => navigate("/employee")} />

      <div className="px-4 mt-4 text-[15px] font-semibold">09.15(월)</div>
      <div className="mt-2">
        <AlarmItem
          icon={<div className="w-full h-full bg-gray-200 rounded-full"></div>}
          title="맥도날드 신촌점"
          time="10분 전"
        >
          사장님이 {new Date().getMonth() + 1}월 시간표 추가를 요청했어요! 근무가능 시간표를 작성해주세요
          <ActionButtons leftLabel="거절" rightLabel="추가하기" onRightClick={() => navigate("/calAddEmp")} />
        </AlarmItem>
      </div>
    </div>
  );
}
export default AlarmHomeEmp;
