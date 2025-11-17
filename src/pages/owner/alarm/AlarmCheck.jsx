import React from "react";
import TopBar from "./TopBar";
import NavBar from "./NavBar";
import AlarmItem from "../alarm/AlarmItem";
import ActionButtons from "../alarm/ActionButtons";


function AlarmCheck({ handleBack }) {
    return (
        <div className="w-full h-full bg-white overflow-y-auto">
            <TopBar title="알림" onBack={handleBack} />
            <NavBar currentTab="final" setCurrentTab={() => {}} />


            <div className="px-4 mt-4 text-[15px] font-semibold">09.15(월)</div>


            <AlarmItem
            icon={<div className="w-full h-full bg-gray-200 rounded-full"></div>}
            title="맥도날드 신청중"
            time="4분 전"
            >
            ‘김혜민’님이 신청한 대타를 ‘오시현’님이 수락했어요. 이 변경을 최종 승인하시겠어요?
            <ActionButtons leftLabel="미승인" rightLabel="승인" />
            </AlarmItem>
        </div>
    );
}
export default AlarmCheck;