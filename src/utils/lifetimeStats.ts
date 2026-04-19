import { LifetimeStats, RoundResult } from '@/types/game';

const STORAGE_KEY = 'smarty-couch-stats';
const MAX_RECENT_SCORES = 10;

const defaultStats: LifetimeStats = {
  highestScore: 0,
  longestStreak: 0,
  timesPlayed: 0,
  recentScores: [],
  categoryStats: {},
};

export const loadLifetimeStats = (): LifetimeStats => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultStats, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
  return defaultStats;
};

export const saveLifetimeStats = (stats: LifetimeStats): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

export const updateLifetimeStats = (
  result: RoundResult,
  category: string,
  correctByCategory: { [key: string]: number }
): LifetimeStats => {
  const stats = loadLifetimeStats();

  stats.highestScore = Math.max(stats.highestScore, result.score);
  stats.longestStreak = Math.max(stats.longestStreak, result.maxStreak);
  stats.timesPlayed += 1;

  Object.entries(correctByCategory).forEach(([cat, correct]) => {
    if (!stats.categoryStats[cat]) {
      stats.categoryStats[cat] = { correct: 0, total: 0 };
    }
    stats.categoryStats[cat].correct += correct;
    stats.categoryStats[cat].total += 1;
  });

  saveLifetimeStats(stats);
  return stats;
};

/**
 * Records a completed game's final score and updates lifetime aggregates.
 * Returns the previous personal best (before this game) so callers can detect
 * a new record.
 */
export const recordGameScore = (finalScore: number): { stats: LifetimeStats; previousBest: number } => {
  const stats = loadLifetimeStats();
  const previousBest = stats.highestScore;

  stats.recentScores = [finalScore, ...(stats.recentScores || [])].slice(0, MAX_RECENT_SCORES);
  stats.highestScore = Math.max(stats.highestScore, finalScore);
  stats.timesPlayed += 1;

  saveLifetimeStats(stats);
  return { stats, previousBest };
};
