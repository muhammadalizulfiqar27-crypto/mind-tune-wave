const STREAK_KEY = "mind_control_daily_streak";

type StreakState = {
  count: number;
  lastVisit: string;
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getPreviousDayKey = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

export const updateDailyStreak = (): number => {
  const today = getTodayKey();
  const yesterday = getPreviousDayKey();

  try {
    const saved = localStorage.getItem(STREAK_KEY);
    const current: StreakState | null = saved ? JSON.parse(saved) : null;

    if (current?.lastVisit === today) return Math.max(current.count, 1);

    const nextCount = current?.lastVisit === yesterday ? current.count + 1 : 1;
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: nextCount, lastVisit: today }));
    return nextCount;
  } catch {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastVisit: today }));
    return 1;
  }
};