//https://connecti.store/swagger-ui/index.html#/
import api from "./Api.js";

//할 일 목록 조회 (카테고리별)
export const getTodos = async (category = null) => {
  try {
    const params = category ? { category } : {};
    const response = await api.get("todos", { params });
    return response.data;
  } catch (error) {
    console.error("할 일 목록 조회 실패:", error);
    throw error;
  }
};

//할 일 추가
export const addTodo = async (title, content, category, dueDate = null) => {
  try {
    const response = await api.post("todos", {
      title,
      content,
      category,
      dueDate,
    });
    return response.data;
  } catch (error) {
    console.error("할 일 추가 실패:", error);
    throw error;
  }
};

//할 일 수정
export const updateTodo = async (todoId, title, content, category, dueDate = null) => {
  try {
    const response = await api.patch(`todos/${todoId}`, {
      title,
      content,
      category,
      dueDate,
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
export const toggleTodoComplete = async (todoId, completed) => {
  try {
    const response = await api.patch(`todos/${todoId}/complete`, {
      completed,
    });
    return response.data;
  } catch (error) {
    console.error("할 일 완료 상태 변경 실패:", error);
    throw error;
  }
};
