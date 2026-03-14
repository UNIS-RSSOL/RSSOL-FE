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
    const requestData = {
      title,
      content,
      category,
      dueDate,
    };
    console.log("📤 POST /todos 요청 데이터:", requestData);
    
    const response = await api.post("todos", requestData);
    
    console.log("✅ POST /todos 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 할 일 추가 실패:", error);
    console.error("에러 상세:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

//할 일 수정
export const updateTodo = async (todoId, title, content, category, dueDate = null) => {
  try {
    const response = await api.put(`todos/${todoId}`, {
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
export const toggleTodoComplete = async (todoId) => {
  try {
    const response = await api.patch(`todos/${todoId}/toggle`);
    return response.data;
  } catch (error) {
    console.error("할 일 완료 상태 변경 실패:", error);
    throw error;
  }
};
