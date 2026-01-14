import dayjs from "dayjs";

export const formatTimeAgo = (dateString) => {
  const now = dayjs();
  const date = dayjs(dateString);
  const seconds = now.diff(date, "second") - 9 * 3600;

  const intervals = {
    년: 31536000,
    개월: 2592000,
    주: 604800,
    일: 86400,
    시간: 3600,
    분: 60,
    초: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1${unit} 전` : `${interval}${unit} 전`;
    }
  }

  return "방금 전";
};
