import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/ko";

import { getActiveStore } from "../../services/MypageService.js";
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
} from "../../services/TodoService.js";

import BellIcon from "../../assets/icons/BellIcon.jsx";
import CalendarIcon from "../../assets/icons/CalendarIcon.jsx";
import EditIcon from "../../assets/icons/EditIcon.jsx";
import FileEditIcon from "../../assets/icons/FileEditIcon.jsx";
import TodoAllIcon from "../../assets/icons/TodoAllIcon.jsx";
import TodoPartnerIcon from "../../assets/icons/TodoPartnerIcon.jsx";
import TodoUserIcon from "../../assets/icons/TodoUserIcon.jsx";
import TodoSelectIcon from "../../assets/icons/TodoSelectIcon.jsx";
import Footer from "../../components/layout/footer/Footer.jsx";
import HomeHeader from "../../components/home/HomeHeader.jsx";

dayjs.locale("ko");

const TODO_CATEGORIES = {
  STORE: "매장 전체",
  HANDOVER: "인수인계",
  PERSONAL: "내 할 일",
};

function OwnerTodo() {
  const navigate = useNavigate();
  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });
  const [todos, setTodos] = useState({
    STORE: [],
    HANDOVER: [],
    PERSONAL: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [editTodoText, setEditTodoText] = useState("");

  // 임시 데이터 (API에서 받아온 할 일이 없을 때만 사용)
  const [mockTodos, setMockTodos] = useState({
    STORE: [
      { id: "mock-store-1", content: "오픈 체크리스트 확인", completed: true },
      { id: "mock-store-2", content: "매장 위생 상태 점검", completed: false },
    ],
    HANDOVER: [
      {
        id: "mock-handover-1",
        content: "마감 보고서 전달",
        completed: false,
      },
      {
        id: "mock-handover-2",
        content: "내일 발주 수량 공유",
        completed: true,
      },
    ],
    PERSONAL: [
      { id: "mock-personal-1", content: "직원 스케줄 정리", completed: false },
      { id: "mock-personal-2", content: "재고 현황 엑셀 정리", completed: true },
    ],
  });

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

  const loadTodos = async () => {
    try {
      const selectedDateStr = currentDate.format("YYYY-MM-DD");
      const res = await getTodos(selectedDateStr);
      setTodos({
        STORE: res.storeTodos || [],
        HANDOVER: res.handoverTodos || [],
        PERSONAL: res.personalTodos || [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const active = await getActiveStore();
        setActiveStore({ storeId: active.storeId, name: active.name });
        await loadTodos();
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 날짜 변경 시 할 일 다시 로드
  useEffect(() => {
    if (!isLoading) {
      loadTodos();
    }
  }, [currentDate]);

  const handleCategoryClick = (category) => {
    setEditingCategory(category);
    setNewTodoText("");
  };

  const handleCreateTodo = async (category) => {
    if (!newTodoText.trim()) {
      setEditingCategory(null);
      return;
    }

    const todoText = newTodoText.trim();
    const dueDate = currentDate.format("YYYY-MM-DD");

    try {
      const response = await addTodo(todoText, category, dueDate);
      
      setNewTodoText("");
      setEditingCategory(null);
      await loadTodos();
    } catch (error) {
      console.error("할 일 생성 실패:", error);
      console.error("에러 상세:", error.response?.data || error.message);
      alert(
        error.response?.data?.message || 
        "할 일 추가에 실패했습니다. 다시 시도해주세요."
      );
    }
  };

  const handleToggleTodo = async (todoId) => {
    try {
      await toggleTodoComplete(todoId);
      await loadTodos();
    } catch (error) {
      console.error("할 일 완료 토글 실패:", error);
    }
  };

  const handleDeleteTodo = async (todoId, e) => {
    e.stopPropagation();
    try {
      await deleteTodo(todoId);
      await loadTodos();
    } catch (error) {
      console.error("할 일 삭제 실패:", error);
    }
  };

  const handleStartEdit = (todo, e) => {
    e.stopPropagation();
    setEditingTodoId(todo.id);
    setEditTodoText(todo.content);
  };

  const handleSaveEdit = async (todo) => {
    if (!editTodoText.trim()) {
      setEditingTodoId(null);
      return;
    }

    try {
      await updateTodo(todo.id, editTodoText.trim());
      setEditingTodoId(null);
      setEditTodoText("");
      await loadTodos();
    } catch (error) {
      console.error("할 일 수정 실패:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditTodoText("");
  };

  // 임시 데이터용 토글 핸들러 (체크 버튼 on/off 전용)
  const handleToggleMockTodo = (categoryKey, todoId) => {
    setMockTodos((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey].map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      ),
    }));
  };

  const canEdit = (category) => {
    // "매장 전체"는 owner만 추가/수정 가능
    if (category === "STORE") return true; // owner는 항상 true
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
          {canEdit("STORE") && (
            <button
              onClick={() => handleCategoryClick("STORE")}
              className="flex items-center justify-between px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[16px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoAllIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.STORE}
                </span>
                <span className="text-[16px] ml-[8px]">+</span>
              </div>
            </button>
          )}
          {editingCategory === "STORE" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTodo("STORE");
              }}
              className="flex items-center gap-[8px] w-full mb-[8px]"
            >
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                autoFocus
                className="flex-1 px-[12px] py-[8px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                placeholder="할 일을 입력하세요"
              />
              <button
                type="submit"
                disabled={!newTodoText.trim()}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  newTodoText.trim()
                    ? "bg-[#3370FF] cursor-pointer hover:bg-[#2563EB]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <svg width="16" height="12" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
          <div className="w-full">
            {/* 실제 데이터가 있으면 실제 데이터, 없으면 임시 데이터 사용 */}
            {(todos.STORE.length > 0 ? todos.STORE : mockTodos.STORE).map(
              (todo) => {
                const isMock = todo.id.toString().startsWith("mock-");
                const onToggle = isMock
                  ? () => handleToggleMockTodo("STORE", todo.id)
                  : () => handleToggleTodo(todo.id);

                return (
                  <div
                    key={todo.id}
                    className="flex items-center gap-[8px] py-[8px] border-b border-gray-100 last:border-b-0"
                  >
                    <div
                      className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center cursor-pointer ${
                        todo.completed
                          ? "bg-[#3370FF] border-[#3370FF]"
                          : "border-[#D9D9D9] bg-white"
                      }`}
                      onClick={onToggle}
                    >
                      {todo.completed && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    {editingTodoId === todo.id && !isMock ? (
                      <input
                        type="text"
                        value={editTodoText}
                        onChange={(e) => setEditTodoText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(todo);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        onBlur={() => handleSaveEdit(todo)}
                        autoFocus
                        className="flex-1 px-[8px] py-[4px] border border-gray-300 rounded-[4px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                      />
                    ) : (
                      <span
                        className="flex-1 text-[14px] cursor-pointer"
                        onClick={(e) => !isMock && handleStartEdit(todo, e)}
                      >
                        {todo.content}
                      </span>
                    )}
                    {!isMock && (
                      <button
                        onClick={(e) => handleDeleteTodo(todo.id, e)}
                        className="text-[16px] text-gray-500 hover:text-red-500 bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none shrink-0"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* 인수인계 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("HANDOVER") && (
            <button
              onClick={() => handleCategoryClick("HANDOVER")}
              className="flex items-center justify-between px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[16px] w-fit"
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
          {editingCategory === "HANDOVER" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTodo("HANDOVER");
              }}
              className="flex items-center gap-[8px] w-full mb-[8px]"
            >
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                autoFocus
                className="flex-1 px-[12px] py-[8px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                placeholder="할 일을 입력하세요"
              />
              <button
                type="submit"
                disabled={!newTodoText.trim()}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  newTodoText.trim()
                    ? "bg-[#3370FF] cursor-pointer hover:bg-[#2563EB]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <svg width="16" height="12" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
          <div className="w-full">
            {(todos.HANDOVER.length > 0
              ? todos.HANDOVER
              : mockTodos.HANDOVER
            ).map((todo) => {
              const isMock = todo.id.toString().startsWith("mock-");
              const onToggle = isMock
                ? () => handleToggleMockTodo("HANDOVER", todo.id)
                : () => handleToggleTodo(todo.id);

              return (
                <div
                  key={todo.id}
                  className="flex items-center gap-[8px] py-[8px] border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center cursor-pointer ${
                      todo.completed
                        ? "bg-[#3370FF] border-[#3370FF]"
                        : "border-[#D9D9D9] bg-white"
                    }`}
                    onClick={onToggle}
                  >
                    {todo.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {editingTodoId === todo.id && !isMock ? (
                    <input
                      type="text"
                      value={editTodoText}
                      onChange={(e) => setEditTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(todo);
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      onBlur={() => handleSaveEdit(todo)}
                      autoFocus
                      className="flex-1 px-[8px] py-[4px] border border-gray-300 rounded-[4px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                    />
                  ) : (
                    <span
                      className="flex-1 text-[14px] cursor-pointer"
                      onClick={(e) => !isMock && handleStartEdit(todo, e)}
                    >
                      {todo.content}
                    </span>
                  )}
                  {!isMock && (
                    <button
                      onClick={(e) => handleDeleteTodo(todo.id, e)}
                      className="text-[16px] text-gray-500 hover:text-red-500 bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 내 할 일 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("PERSONAL") && (
            <button
              onClick={() => handleCategoryClick("PERSONAL")}
              className="flex items-center justify-between px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[16px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoUserIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.PERSONAL}
                </span>
                <span className="text-[16px] ml-[8px]">+</span>
              </div>
            </button>
          )}
          {editingCategory === "PERSONAL" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateTodo("PERSONAL");
              }}
              className="flex items-center gap-[8px] w-full mb-[8px]"
            >
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                autoFocus
                className="flex-1 px-[12px] py-[8px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                placeholder="할 일을 입력하세요"
              />
              <button
                type="submit"
                disabled={!newTodoText.trim()}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  newTodoText.trim()
                    ? "bg-[#3370FF] cursor-pointer hover:bg-[#2563EB]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <svg width="16" height="12" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          )}
          <div className="w-full">
            {(todos.PERSONAL.length > 0
              ? todos.PERSONAL
              : mockTodos.PERSONAL
            ).map((todo) => {
              const isMock = todo.id.toString().startsWith("mock-");
              const onToggle = isMock
                ? () => handleToggleMockTodo("PERSONAL", todo.id)
                : () => handleToggleTodo(todo.id);

              return (
                <div
                  key={todo.id}
                  className="flex items-center gap-[8px] py-[8px] border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center cursor-pointer ${
                      todo.completed
                        ? "bg-[#3370FF] border-[#3370FF]"
                        : "border-[#D9D9D9] bg-white"
                    }`}
                    onClick={onToggle}
                  >
                    {todo.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  {editingTodoId === todo.id && !isMock ? (
                    <input
                      type="text"
                      value={editTodoText}
                      onChange={(e) => setEditTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit(todo);
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      onBlur={() => handleSaveEdit(todo)}
                      autoFocus
                      className="flex-1 px-[8px] py-[4px] border border-gray-300 rounded-[4px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                    />
                  ) : (
                    <span
                      className="flex-1 text-[14px] cursor-pointer"
                      onClick={(e) => !isMock && handleStartEdit(todo, e)}
                    >
                      {todo.content}
                    </span>
                  )}
                  {!isMock && (
                    <button
                      onClick={(e) => handleDeleteTodo(todo.id, e)}
                      className="text-[16px] text-gray-500 hover:text-red-500 bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

    <Footer />
    </div>
  );
}

export default OwnerTodo;
