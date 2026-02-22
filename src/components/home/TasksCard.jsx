function TasksCard({ todos, onToggle }) {
  return (
    <div className="border-[1px] border-[#E7EAF3] rounded-[25px] overflow-hidden mb-[16px]">
      <div className="px-[16px] py-[14px]">
        <div className="flex items-center justify-between mb-[12px]">
          <p className="text-[16px] font-[600]">오늘 해야할 일</p>
          <span className="inline-flex items-center justify-center min-w-[70px] h-[30px] bg-[#F0F0F0] text-[#87888c] rounded-[20px] px-[12px] text-[12px] font-[500]">
            매장전체
          </span>
        </div>
        <div className="flex flex-col gap-[8px]">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-[8px] cursor-pointer"
              onClick={() => onToggle(todo.id)}
            >
              <div
                className={`w-[20px] h-[20px] rounded-full border-[2px] shrink-0 flex items-center justify-center ${
                  todo.done
                    ? "bg-[#3370FF] border-[#3370FF]"
                    : "border-[#D9D9D9] bg-white"
                }`}
              >
                {todo.done && (
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
              <span className="text-[14px]">{todo.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TasksCard;
