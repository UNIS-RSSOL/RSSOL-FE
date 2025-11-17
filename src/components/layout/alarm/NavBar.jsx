import React from "react";


function NavBar({ currentTab, setCurrentTab }) {
    return (
        <div className="flex w-full h-[44px] border-b border-gray-200 text-[15px] font-medium">
            <div
                onClick={() => setCurrentTab("all")}
                className={`flex-1 flex items-center justify-center cursor-pointer relative ${
                currentTab === "all" ? "text-[#68E194]" : "text-gray-400"
                }`}
            >
                전체 알림
                {currentTab === "all" && (
                <div className="absolute bottom-0 h-[3px] w-full bg-[#68E194]"></div>
                )}
            </div>


            <div
            onClick={() => setCurrentTab("final")}
            className={`flex-1 flex items-center justify-center cursor-pointer relative ${
            currentTab === "final" ? "text-[#68E194]" : "text-gray-400"
            }`}
            >
            최종 승인
            {currentTab === "final" && (
            <div className="absolute bottom-0 h-[3px] w-full bg-[#68E194]"></div>
            )}
            </div>
        </div>
    );
}

export default NavBar;