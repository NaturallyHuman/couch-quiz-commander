export const BASE_SCORE = 100;
export const MIN_STREAK_FOR_BONUS = 3;

// Escalating streak bonus schedule. Bonus is awarded on the answer that
// brings the streak to N. Caps at 7+ to keep numbers sane.
const STREAK_BONUS_SCHEDULE: { [streak: number]: number } = {
  3: 50,
  4: 100,
  5: 200,
  6: 400,
};
const STREAK_BONUS_CAP = 800; // for streak >= 7

export const getStreakBonus = (streak: number): number => {
  if (streak < MIN_STREAK_FOR_BONUS) return 0;
  if (streak >= 7) return STREAK_BONUS_CAP;
  return STREAK_BONUS_SCHEDULE[streak] ?? 0;
};

export const calculateScore = (
  isCorrect: boolean,
  _timeRemaining: number,
  _maxTime: number,
  currentStreak: number
): { points: number; breakdown: { base: number; timer: number; streak: number } } => {
  if (!isCorrect) {
    return { points: 0, breakdown: { base: 0, timer: 0, streak: 0 } };
  }

  const base = BASE_SCORE;
  const streakBonus = getStreakBonus(currentStreak);

  return {
    points: base + streakBonus,
    breakdown: { base, timer: 0, streak: streakBonus },
  };
};
