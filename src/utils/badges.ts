import { Badge, PlayerStats } from '@/types/game';

export const BADGES: Badge[] = [
  {
    id: 'certified-genius',
    name: 'Certified Genius',
    description: 'Score 900+ points',
    icon: '🧠',
    condition: (stats) => stats.totalScore >= 900,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Maintain a 5+ answer streak',
    icon: '⚡',
    condition: (stats) => stats.maxStreak >= 5,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Answer all questions correctly',
    icon: '💎',
    condition: (stats) => stats.correctAnswers === stats.totalQuestions && stats.totalQuestions > 0,
  },
  {
    id: 'sharp-mind',
    name: 'Sharp Mind',
    description: 'Score 700+ points',
    icon: '🎯',
    condition: (stats) => stats.totalScore >= 700,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Get 15+ correct answers',
    icon: '📚',
    condition: (stats) => stats.correctAnswers >= 15,
  },
  {
    id: 'bird-brain',
    name: 'Bird Brain',
    description: 'Score less than 200 points',
    icon: '🐦',
    condition: (stats) => stats.totalScore < 200 && stats.totalQuestions > 0,
  },
];

export const getEarnedBadges = (stats: PlayerStats): Badge[] => {
  return BADGES.filter(badge => badge.condition(stats));
};

export const getRank = (score: number): { name: string; icon: string } => {
  if (score >= 1000) return { name: 'Trivia Master', icon: '👑' };
  if (score >= 800) return { name: 'Genius', icon: '🧠' };
  if (score >= 600) return { name: 'Scholar', icon: '🎓' };
  if (score >= 400) return { name: 'Student', icon: '📖' };
  if (score >= 200) return { name: 'Beginner', icon: '🌱' };
  return { name: 'Novice', icon: '🐣' };
};
