// 알림 관리 유틸리티 함수 (localStorage 기반)

const NOTIFICATION_STORAGE_KEY = 'employee_notifications';

/**
 * 알바생 ID별 알림 목록 가져오기
 * @param {number} employeeId - 알바생 ID
 * @returns {Array} 알림 목록
 */
export function getNotifications(employeeId) {
  try {
    const key = `${NOTIFICATION_STORAGE_KEY}_${employeeId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('알림 가져오기 실패:', error);
    return [];
  }
}

/**
 * 알바생 ID별 알림 추가
 * @param {number} employeeId - 알바생 ID
 * @param {Object} notification - 알림 객체
 */
export function addNotification(employeeId, notification) {
  try {
    const key = `${NOTIFICATION_STORAGE_KEY}_${employeeId}`;
    const notifications = getNotifications(employeeId);
    
    const newNotification = {
      id: Date.now() + Math.random(), // 고유 ID 생성
      ...notification,
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    notifications.unshift(newNotification); // 최신 알림을 맨 앞에 추가
    localStorage.setItem(key, JSON.stringify(notifications));
    return newNotification;
  } catch (error) {
    console.error('알림 추가 실패:', error);
    throw error;
  }
}

/**
 * 같은 매장의 모든 알바생들에게 알림 추가
 * @param {Array} employeeIds - 알바생 ID 배열
 * @param {Object} notification - 알림 객체
 */
export function addNotificationToEmployees(employeeIds, notification) {
  try {
    employeeIds.forEach((employeeId) => {
      addNotification(employeeId, notification);
    });
    return true;
  } catch (error) {
    console.error('알바생들에게 알림 추가 실패:', error);
    throw error;
  }
}

/**
 * 알림 삭제
 * @param {number} employeeId - 알바생 ID
 * @param {number} notificationId - 알림 ID
 */
export function deleteNotification(employeeId, notificationId) {
  try {
    const key = `${NOTIFICATION_STORAGE_KEY}_${employeeId}`;
    const notifications = getNotifications(employeeId);
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (error) {
    console.error('알림 삭제 실패:', error);
    throw error;
  }
}

/**
 * 알림 읽음 처리
 * @param {number} employeeId - 알바생 ID
 * @param {number} notificationId - 알림 ID
 */
export function markAsRead(employeeId, notificationId) {
  try {
    const key = `${NOTIFICATION_STORAGE_KEY}_${employeeId}`;
    const notifications = getNotifications(employeeId);
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
    throw error;
  }
}

/**
 * 시간 포맷팅 (예: "10분 전", "1시간 전", "2024.01.15")
 */
export function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\./g, '.').replace(/\s/g, '');
}

