import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import TopBar from "../../../components/common/alarm/TopBar.jsx";
import BottomBar from "../../../components/layout/common/BottomBar.jsx";
import AutoCalCalendar from "../../../components/common/calendar/AutoCalCalendar.jsx";
import Modal from "../../../components/common/Modal.jsx";
import WhiteBtn from "../../../components/common/WhiteBtn.jsx";
import GreenBtn from "../../../components/common/GreenBtn.jsx";
import {
  confirmSchedule,
  fetchCandidateSchedule,
} from "../../../services/scheduleService.js";

dayjs.locale("ko");

/**
 * 근무표 자동 생성 결과(후보들)를 선택하는 화면
 * - CalAdd에서 근무표 생성 후 넘어옴
 * - 번호 버튼으로 후보 인덱스를 선택하고, 선택한 후보를 확정
 */
export default function AutoCal() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    candidateKey,
    startDate,
    endDate,
    generatedCount = 5,
  } = location.state || {};

  // 기본값 설정 (state가 없어도 동작하도록)
  const defaultStartDate = startDate || dayjs().format("YYYY-MM-DD");
  const defaultEndDate = endDate || dayjs().add(6, "day").format("YYYY-MM-DD");

  const [selectedIndex, setSelectedIndex] = useState(null); // 초기값 null (아무것도 선택 안 함)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidateSchedules, setCandidateSchedules] = useState({}); // 각 대안별 스케줄 데이터

  const candidates = Array.from(
    { length: Math.max(generatedCount, 1) },
    (_, idx) => idx,
  );

  // 각 대안별 스케줄 데이터 가져오기
  useEffect(() => {
    if (!candidateKey) return;

    const loadCandidateSchedules = async () => {
      const schedules = {};
      for (let i = 0; i < candidates.length; i++) {
        try {
          const data = await fetchCandidateSchedule(candidateKey, i);
          schedules[i] = data || [];
        } catch (error) {
          console.error(`대안 ${i + 1} 스케줄 로드 실패:`, error);
          schedules[i] = [];
        }
      }
      setCandidateSchedules(schedules);
    };

    loadCandidateSchedules();
  }, [candidateKey, generatedCount]);

  // 스케줄 데이터를 기반으로 미리보기 그리드 생성
  const generatePreviewGrid = (scheduleData) => {
    if (!scheduleData || scheduleData.length === 0) {
      return Array.from({ length: 14 }, () => false);
    }

    // 주간 그리드 (7일 x 2행 = 14칸)
    const grid = Array.from({ length: 14 }, () => false);

    // 각 스케줄을 그리드에 매핑
    scheduleData.forEach((schedule) => {
      const startDate = dayjs(schedule.startDatetime);
      const dayOfWeek = startDate.day(); // 0(일) ~ 6(토)
      // 간단히 해당 요일에 스케줄이 있다고 표시
      if (dayOfWeek < 7) {
        grid[dayOfWeek] = true;
        if (dayOfWeek + 7 < 14) {
          grid[dayOfWeek + 7] = true;
        }
      }
    });

    return grid;
  };

  // 선택된 대안의 시작 날짜를 WeekCalendar에 전달 (주간 캘린더 기준)
  const calendarDate = dayjs(defaultStartDate).locale("ko");

  const handleSave = async () => {
    if (selectedIndex === null) {
      alert("대안을 선택해주세요.");
      return;
    }

    if (!candidateKey) {
      alert("근무표 후보 정보가 없습니다. 먼저 근무표를 생성해주세요.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const result = await confirmSchedule(
        candidateKey,
        selectedIndex,
        defaultStartDate,
        defaultEndDate,
      );

      if (result && result.status === "success") {
        setIsModalOpen(true);
      } else {
        alert("근무표 확정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("근무표 확정 실패:", error);
      alert("근무표 확정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalButton = (action) => {
    setIsModalOpen(false);
    if (action === "view") {
      navigate("/owner/calendar");
    } else if (action === "edit") {
      navigate("/owner/calendar");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-[#F8FBFE]">
      <TopBar title="근무표 대안 선택" onBack={() => navigate(-1)} />

      <div className="flex-1 flex flex-col px-4 py-4 gap-4 overflow-y-scroll scrollbar-hide">
        {/* 제목과 소제목 */}
        <div className="flex flex-col gap-1">
          <div className="text-[16px] font-semibold">자동 스케줄 생성</div>
          <div className="text-[14px] text-[#666]">
            근무표가 생성되었어요. 마음에 드는 근무표를 저장하세요
          </div>
        </div>

        {/* 대안 번호 버튼들 (수평 나열) */}
        <div className="flex flex-row gap-2 overflow-x-scroll scrollbar-hide">
          {candidates.map((idx) => {
            const isActive = idx === selectedIndex;
            const scheduleData = candidateSchedules[idx] || [];
            const previewGrid = generatePreviewGrid(scheduleData);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                style={{
                  backgroundColor: "white",
                  WebkitAppearance: "none",
                  appearance: "none",
                }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg border border-black flex items-center justify-center overflow-hidden ${
                  isActive ? "border-[#32D1AA] border-2" : ""
                }`}
              >
                {/* 숫자 - 왼쪽 상단 */}
                <span
                  className={`absolute top-0.5 left-0.5 text-[10px] font-semibold z-10 ${
                    isActive ? "text-[#32D1AA]" : "text-[#666]"
                  }`}
                >
                  {idx + 1}
                </span>

                {/* 작은 캘린더 미리보기 - 배경 꽉차게 */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-full bg-[#F8FBFE] flex flex-col">
                    {/* 간단한 캘린더 그리드 미리보기 */}
                    <div className="flex-1 grid grid-cols-7 gap-px p-0.5">
                      {previewGrid.map((hasSchedule, i) => (
                        <div
                          key={i}
                          className={`${
                            hasSchedule
                              ? "bg-[#32D1AA] opacity-40"
                              : "bg-transparent"
                          } rounded-sm`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* AutoCal 전용 캘린더 */}
        <div className="flex justify-center mt-2">
          <AutoCalCalendar
            hasSelection={selectedIndex !== null}
            schedules={
              selectedIndex !== null ? candidateSchedules[selectedIndex] : []
            }
          />
        </div>
      </div>

      <BottomBar
        singleButton
        singleButtonText={isSubmitting ? "저장 중..." : "근무표 저장하기"}
        onSingleClick={handleSave}
      />

      {/* 완료 모달 */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="flex flex-col items-center justify-center gap-2">
              <p className="text-[16px] font-[400]">
                근무표 생성이 완료되었어요!
              </p>
            </div>
            <div className="flex flex-row w-full gap-2">
              <WhiteBtn
                className="flex-1 h-[35px] text-[14px] font-[500]"
                onClick={() => handleModalButton("edit")}
              >
                근무표 수정하기
              </WhiteBtn>
              <GreenBtn
                className="flex-1 h-[35px] text-[14px] font-[500]"
                onClick={() => handleModalButton("view")}
              >
                근무표 보러가기
              </GreenBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
