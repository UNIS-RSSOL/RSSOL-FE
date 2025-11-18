import React, { useState } from "react";
import TopBar from "../../../components/layout/alarm/TopBar";
import NavBar from "../../../components/layout/alarm/NavBar";
import AlarmItem from "../../../components/layout/alarm/AlarmItem";
import ActionButtons from "../../../components/layout/alarm/ActionButtons";


function AlarmHome({ handleBack }) {
    const [tab, setTab] = useState("all");

    return (
        <div className="w-full h-full bg-white overflow-y-auto">
            <TopBar title="알림" onBack={handleBack} />
            <NavBar currentTab={tab} setCurrentTab={setTab} />

            <div className="px-4 mt-4 text-[15px] font-semibold">09.15(월)</div>
            <div className="mt-2">
            <AlarmItem
            icon={<div className="w-full h-full bg-gray-200 rounded-full"></div>}
            title="맥도날드 신촌점"
            time="10분 전"
            >
            ‘김혜민’님이 15(월) 13:00~16:00 근무를 부탁했어요!
            <ActionButtons leftLabel="거절" rightLabel="수락" />
            </AlarmItem>
            </div>
        </div>
    );
}
export default AlarmHome;