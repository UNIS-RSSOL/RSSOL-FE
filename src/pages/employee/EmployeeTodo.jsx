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
import FooterMenu from "../../components/layout/footer/FooterMenu.jsx";

import HomeHeader from "../../components/home/HomeHeader.jsx";

dayjs.locale("ko");

const TODO_CATEGORIES = {
  STORE_ALL: "매장 전체",
  HANDOVER: "인수인계",
  MY_TODO: "내 할 일",
};

function EmployeeTodo() {
  const navigate = useNavigate();
  const [activeStore, setActiveStore] = useState({ storeId: null, name: "" });
  const [todos, setTodos] = useState({
    STORE_ALL: [],
    HANDOVER: [],
    MY_TODO: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [editTodoText, setEditTodoText] = useState("");

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
      const allTodos = await getTodos();
      const selectedDateStr = currentDate.format("YYYY-MM-DD");
      
      // 날짜별로 필터링 (dueDate가 없거나 선택한 날짜와 일치하는 할 일만 표시)
      const filteredTodos = allTodos.filter((todo) => {
        if (!todo.dueDate) return true; // dueDate가 없으면 모든 날짜에 표시
        const todoDate = dayjs(todo.dueDate).format("YYYY-MM-DD");
        return todoDate === selectedDateStr;
      });
      
      const categorized = {
        STORE_ALL: filteredTodos.filter((todo) => todo.category === "STORE_ALL"),
        HANDOVER: filteredTodos.filter((todo) => todo.category === "HANDOVER"),
        MY_TODO: filteredTodos.filter((todo) => todo.category === "MY_TODO"),
      };
      setTodos(categorized);
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

    try {
      const dueDate = currentDate.format("YYYY-MM-DD");
      await addTodo(newTodoText.trim(), "", category, dueDate);
      setNewTodoText("");
      setEditingCategory(null);
      await loadTodos();
    } catch (error) {
      console.error("할 일 생성 실패:", error);
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
    setEditTodoText(todo.title);
  };

  const handleSaveEdit = async (todo) => {
    if (!editTodoText.trim()) {
      setEditingTodoId(null);
      return;
    }

    try {
      await updateTodo(todo.id, editTodoText.trim(), todo.content || "", todo.category);
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

  const canEdit = (category) => {
    // "매장 전체"는 employee는 추가/수정 불가
    if (category === "STORE_ALL") return false;
    // "인수인계"와 "내 할 일"은 모두 추가/수정 가능
    return true;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white font-Pretendard">
      <HomeHeader
        storeName={activeStore.name}
        onMenuClick={() => {}}
        rightIcon={<BellIcon />}
        onRightClick={() => navigate("/employee/notification")}
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
          <button
            onClick={() => {
              if (canEdit("STORE_ALL")) {
                handleCategoryClick("STORE_ALL");
              }
            }}
            disabled={!canEdit("STORE_ALL")}
            className="flex items-center gap-[8px] px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[12px] w-fit disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
          >
            <div className="flex items-center gap-[8px]">
              <TodoAllIcon />
              <span className="text-[14px] font-[500]">
                {TODO_CATEGORIES.STORE_ALL}
              </span>
              <span className="text-[16px]">+</span>
            </div>
          </button>
          {editingCategory === "STORE_ALL" && canEdit("STORE_ALL") && (
            <div className="flex items-center gap-[8px] w-full mb-[8px]">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTodo("STORE_ALL");
                  }
                }}
                autoFocus
                className="flex-1 px-[12px] py-[8px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                placeholder="할 일을 입력하세요"
              />
              <button
                type="button"
                onClick={() => handleCreateTodo("STORE_ALL")}
                disabled={!newTodoText.trim()}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 ${
                  newTodoText.trim()
                    ? "bg-[#3370FF] cursor-pointer"
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
            </div>
          )}
          <div className="space-y-[8px] w-full">
            {todos.STORE_ALL.length === 0 && editingCategory !== "STORE_ALL" ? (
              <p className="text-[14px] text-gray-400 text-left py-[16px]">
                할 일이 없습니다
              </p>
            ) : (
              todos.STORE_ALL.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-[8px] p-[12px] bg-gray-50 rounded-[8px] border border-gray-200"
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center cursor-pointer ${
                      todo.completed
                        ? "bg-[#3370FF] border-[#3370FF]"
                        : "border-[#D9D9D9] bg-white"
                    }`}
                    onClick={() => handleToggleTodo(todo.id)}
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
                  {editingTodoId === todo.id ? (
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
                      onClick={(e) => canEdit("STORE_ALL") && handleStartEdit(todo, e)}
                    >
                      {todo.title}
                    </span>
                  )}
                  {canEdit("STORE_ALL") && (
                    <button
                      onClick={(e) => handleDeleteTodo(todo.id, e)}
                      className="text-[16px] text-gray-500 hover:text-red-500 bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 인수인계 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("HANDOVER") && (
            <button
              onClick={() => handleCategoryClick("HANDOVER")}
              className="flex items-center gap-[8px] px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[12px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoPartnerIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.HANDOVER}
                </span>
                <span className="text-[16px]">+</span>
              </div>
            </button>
          )}
          {editingCategory === "HANDOVER" && (
            <div className="flex items-center gap-[8px] w-full mb-[8px]">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTodo("HANDOVER");
                  }
                }}
                autoFocus
                className="flex-1 px-[12px] py-[8px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                placeholder="할 일을 입력하세요"
              />
              <button
                type="button"
                onClick={() => handleCreateTodo("HANDOVER")}
                disabled={!newTodoText.trim()}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 ${
                  newTodoText.trim()
                    ? "bg-[#3370FF] cursor-pointer"
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
            </div>
          )}
          <div className="space-y-[8px] w-full">
            {todos.HANDOVER.length === 0 && editingCategory !== "HANDOVER" ? (
              <p className="text-[14px] text-gray-400 text-left py-[16px]">
                할 일이 없습니다
              </p>
            ) : (
              todos.HANDOVER.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-[8px] p-[12px] bg-gray-50 rounded-[8px] border border-gray-200"
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center cursor-pointer ${
                      todo.completed
                        ? "bg-[#3370FF] border-[#3370FF]"
                        : "border-[#D9D9D9] bg-white"
                    }`}
                    onClick={() => handleToggleTodo(todo.id)}
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
                  {editingTodoId === todo.id ? (
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
                      onClick={(e) => handleStartEdit(todo, e)}
                    >
                      {todo.title}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteTodo(todo.id, e)}
                    className="text-[16px] text-gray-500 hover:text-red-500 bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 내 할 일 */}
        <div className="mb-[32px] flex flex-col items-start">
          {canEdit("MY_TODO") && (
            <button
              onClick={() => handleCategoryClick("MY_TODO")}
              className="flex items-center gap-[8px] px-[16px] h-[40px] rounded-[20px] border bg-[#ffffff] mb-[12px] w-fit"
              style={{ borderWidth: "1px", borderColor: "#C7C7C7" }}
            >
              <div className="flex items-center gap-[8px]">
                <TodoUserIcon />
                <span className="text-[14px] font-[500]">
                  {TODO_CATEGORIES.MY_TODO}
                </span>
                <span className="text-[16px]">+</span>
              </div>
            </button>
          )}
          {editingCategory === "MY_TODO" && (
            <div className="flex items-center gap-[8px] w-full mb-[8px]">
              <input
                type="text"
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTodo("MY_TODO");
                  }
                }}
                autoFocus
                className="flex-1 px-[12px] py-[8px] border border-gray-300 rounded-[8px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3370FF]"
                placeholder="할 일을 입력하세요"
              />
              <button
                type="button"
                onClick={() => handleCreateTodo("MY_TODO")}
                disabled={!newTodoText.trim()}
                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 ${
                  newTodoText.trim()
                    ? "bg-[#3370FF] cursor-pointer"
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
            </div>
          )}
          <div className="space-y-[8px] w-full">
            {todos.MY_TODO.length === 0 && editingCategory !== "MY_TODO" ? (
              <p className="text-[14px] text-gray-400 text-left py-[16px]">
                할 일이 없습니다
              </p>
            ) : (
              todos.MY_TODO.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-[8px] p-[12px] bg-gray-50 rounded-[8px] border border-gray-200"
                >
                  <div
                    className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center cursor-pointer ${
                      todo.completed
                        ? "bg-[#3370FF] border-[#3370FF]"
                        : "border-[#D9D9D9] bg-white"
                    }`}
                    onClick={() => handleToggleTodo(todo.id)}
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
                  {editingTodoId === todo.id ? (
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
                      onClick={(e) => handleStartEdit(todo, e)}
                    >
                      {todo.title}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleDeleteTodo(todo.id, e)}
                    className="text-[16px] text-gray-500 hover:text-red-500 bg-transparent border-none p-0 cursor-pointer appearance-none outline-none focus:outline-none shrink-0"
                  >
                    ×
                  </button>
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
          onClick={() => navigate("/employee")}
        />
        <FooterMenu
          MenuIcon={<CalendarIcon />}
          title="캘린더"
          onClick={() => navigate("/employee/calendar")}
        />
        <FooterMenu
          MenuIcon={<TodoSelectIcon />}
          title="할 일"
          onClick={() => {}}
        />
        <FooterMenu
          MenuIcon={<FileEditIcon />}
          title="근무표 제출"
          onClick={() => navigate("/employee/schedule/modifying")}
        />
      </nav>
    </div>
  );
}

export default EmployeeTodo;
