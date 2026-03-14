//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//할 일 목록 조회 (날짜별)
export const getTodos = async (date) => {
  try {
    const response = await api.get("todos", { params: { date } });
    return response.data;
  } catch (error) {
    console.error("할 일 목록 조회 실패:", error);
    throw error;
  }
};

//할 일 추가
export const addTodo = async (content, todoType, date) => {
  try {
    const response = await api.post("todos", {
      date,
      todoType,
      content,
    });
    return response.data;
  } catch (error) {
    console.error("할 일 추가 실패:", error);
    throw error;
  }
};

//할 일 수정
export const updateTodo = async (todoId, content) => {
  try {
    const response = await api.put(`todos/${todoId}`, {
      content,
    });
    return response.data;
  } catch (error) {
    console.error("할 일 수정 실패:", error);
    throw error;
  }
};

//할 일 삭제
export const deleteTodo = async (todoId) => {
  try {
    const response = await api.delete(`todos/${todoId}`);
    return response.data;
  } catch (error) {
    console.error("할 일 삭제 실패:", error);
    throw error;
  }
};

//할 일 완료/미완료 토글
export const toggleTodoComplete = async (todoId) => {
  try {
    const response = await api.patch(`todos/${todoId}/toggle`);
    return response.data;
  } catch (error) {
    console.error("할 일 완료 상태 변경 실패:", error);
    throw error;
  }
};
