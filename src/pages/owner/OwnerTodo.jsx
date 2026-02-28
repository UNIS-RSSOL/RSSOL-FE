import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import { getActiveStore } from "../../services/MypageService.js";
import { getTodos } from "../../services/TodoService.js";

import BellIcon from "../../assets/icons/BellIcon.jsx";
import CalendarIcon from "../../assets/icons/CalendarIcon.jsx";
import EditIcon from "../../assets/icons/EditIcon.jsx";
import FileEditIcon from "../../assets/icons/FileEditIcon.jsx";
import TodoAllIcon from "../../assets/icons/TodoAllIcon.jsx";
import TodoPartnerIcon from "../../assets/icons/TodoPartnerIcon.jsx";
import TodoUserIcon from "../../assets/icons/TodoUserIcon.jsx";
import TodoSelectIcon from "../../assets/icons/TodoSelectIcon.jsx";
import FooterMenu from "../../components/layout/footer/FooterMenu.jsx";

import HomeHeader from "../../components/home/HomeHeader.jsx";

dayjs.locale("ko");

const TODO_CATEGORIES = {
  STORE_ALL: "매장 전체",
  HANDOVER: "인수인계",
  MY_TODO: "내 할 일",
};

function OwnerTodo() {
  const navigate = useNavigate();
  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });
  const [todos, setTodos] = useState({
    STORE_ALL: [],
    HANDOVER: [],
    MY_TODO: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(dayjs());
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = days[currentDate.day()];
  const formattedDate = `${currentDate.format("YYYY.MM.DD")}(${dayOfWeek})`;

  const handlePrevDate = () => {
    setCurrentDate((prev) => prev.subtract(1, "day"));
  };

  const handleNextDate = () => {
    setCurrentDate((prev) => prev.add(1, "day"));
  };

  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStore({ storeId: active.storeId, name: active.name });

        // 모든 카테고리의 할 일 조회
        const allTodos = await getTodos();
        
        // 카테고리별로 분류
        const categorized = {
          STORE_ALL: allTodos.filter((todo) => todo.category === "STORE_ALL"),
          HANDOVER: allTodos.filter((todo) => todo.category === "HANDOVER"),
          MY_TODO: allTodos.filter((todo) => todo.category === "MY_TODO"),
        };
        
        setTodos(categorized);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const canEdit = (category) => {
    // "매장 전체"는 owner만 추가/수정 가능
    if (category === "STORE_ALL") return true; // owner는 항상 true
    // "인수인계"와 "내 할 일"은 모두 추가/수정 가능
    return true;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      <HomeHeader
        storeName={activeStore.name}
        onMenuClick={() => {}}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/owner/notification/home")}
      />

      <main className="flex-1 overflow-y-auto px-[16px] pt-[16px] pb-[16px]">
        {/* 날짜 표시 */}
        <div className="flex items-center justify-center gap-[8px] mb-[24px]">
          <button
            onClick={handlePrevDate}
            className="bg-transparent border-none p-0 cursor-pointer text-[16px] font-[600] leading-[24px] appearance-none outline-none focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent"
          >
            &lt;
          </button>
          <p className="text-[16px] font-[600] leading-[24px]">
            {formattedDate}
          </p>
          <button
            onClick={handleNextDate}
            className="bg-transparent border-none p-0 cursor-pointer text-[16px] font-[600] leading-[24px] appearance-none outline-none focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent"
          >
            &gt;
          </button>
        </div>

        {/* 매장 전체 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("STORE_ALL") && (
            <button
              onClick={() => {
                /* TODO: 추가 모달 열기 */
              }}
              className="flex items-center justify-between px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[12px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoAllIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.STORE_ALL}
                </span>
                <span className="text-[16px] ml-[8px]">+</span>
              </div>
            </button>
          )}
          <div className="space-y-[8px]">
            {todos.STORE_ALL.length === 0 ? (
              <p className="text-[14px] text-gray-400 text-left py-[16px]">
                할 일이 없습니다
              </p>
            ) : (
              todos.STORE_ALL.map((todo) => (
                <div
                  key={todo.id}
                  className="p-[12px] bg-gray-50 rounded-[8px] border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[14px] font-[500] mb-[4px]">
                        {todo.title}
                      </p>
                      {todo.content && (
                        <p className="text-[12px] text-gray-600">
                          {todo.content}
                        </p>
                      )}
                    </div>
                    {canEdit("STORE_ALL") && (
                      <button className="text-[12px] text-gray-500 ml-[8px] bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent">
                        수정
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 인수인계 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("HANDOVER") && (
            <button
              onClick={() => {
                /* TODO: 추가 모달 열기 */
              }}
              className="flex items-center justify-between px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[12px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoPartnerIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.HANDOVER}
                </span>
                <span className="text-[16px] ml-[8px]">+</span>
              </div>

            </button>
          )}
          <div className="space-y-[8px]">
            {todos.HANDOVER.length === 0 ? (
              <p className="text-[14px] text-gray-400 text-left py-[16px]">
                할 일이 없습니다
              </p>
            ) : (
              todos.HANDOVER.map((todo) => (
                <div
                  key={todo.id}
                  className="p-[12px] bg-gray-50 rounded-[8px] border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[14px] font-[500] mb-[4px]">
                        {todo.title}
                      </p>
                      {todo.content && (
                        <p className="text-[12px] text-gray-600">
                          {todo.content}
                        </p>
                      )}
                    </div>
                    {canEdit("HANDOVER") && (
                      <button className="text-[12px] text-gray-500 ml-[8px] bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent">
                        수정
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 내 할 일 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("MY_TODO") && (
            <button
              onClick={() => {
                /* TODO: 추가 모달 열기 */
              }}
              className="flex items-center justify-between px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[12px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoUserIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.MY_TODO}
                </span>
                <span className="text-[16px] ml-[8px]">+</span>
              </div>
            </button>
          )}
          <div className="space-y-[8px]">
            {todos.MY_TODO.length === 0 ? (
              <p className="text-[14px] text-gray-400 text-left py-[16px]">
                할 일이 없습니다
              </p>
            ) : (
              todos.MY_TODO.map((todo) => (
                <div
                  key={todo.id}
                  className="p-[12px] bg-gray-50 rounded-[8px] border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[14px] font-[500] mb-[4px]">
                        {todo.title}
                      </p>
                      {todo.content && (
                        <p className="text-[12px] text-gray-600">
                          {todo.content}
                        </p>
                      )}
                    </div>
                    {canEdit("MY_TODO") && (
                      <button className="text-[12px] text-gray-500 ml-[8px] bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent">
                        수정
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <nav className="w-full h-[60px] flex flex-row justify-around items-center shrink-0 shadow-[0_-2px_7px_0_rgba(0,0,0,0.1)] bg-white">
        <FooterMenu
          MenuIcon={
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M1 7.41605C1 7.04666 1.18802 6.7001 1.50457 6.48603L9.30457 1.21117C9.72092 0.929609 10.2791 0.92961 10.6954 1.21117L18.4954 6.48603C18.812 6.7001 19 7.04665 19 7.41605V17.2882C19 18.2336 18.1941 19 17.2 19H2.8C1.80589 19 1 18.2336 1 17.2882V7.41605Z"
                fill="none"
              />
              <path
                d="M5.5 15.0625H14.5M9.30457 1.21117L1.50457 6.48603C1.18802 6.7001 1 7.04666 1 7.41605V17.2882C1 18.2336 1.80589 19 2.8 19H17.2C18.1941 19 19 18.2336 19 17.2882V7.41605C19 7.04665 18.812 6.7001 18.4954 6.48603L10.6954 1.21117C10.2791 0.92961 9.72092 0.929609 9.30457 1.21117Z"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          title="홈"
          onClick={() => navigate("/owner")}
        />
        <FooterMenu
          MenuIcon={<CalendarIcon />}
          title="캘린더"
          onClick={() => navigate("/owner/calendar")}
        />
        <FooterMenu
          MenuIcon={<TodoSelectIcon />}
          title="할 일"
          onClick={() => {}}
        />
        <FooterMenu
          MenuIcon={<FileEditIcon />}
          title="근무표 제출"
          onClick={() => navigate("/owner/schedule/modifying")}
        />
      </nav>
    </div>
  );
}

export default OwnerTodo;
