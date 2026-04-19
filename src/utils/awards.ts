import { PlayerStats } from '@/types/game';

export interface Award {
  id: string;
  name: string;
  description: string;
}

export interface AwardContext {
  player: PlayerStats;
  finalScore: number;
  previousBest: number;
}

type AwardCandidate = {
  award: Award;
  earned: boolean; // true = based on actual play, false = pure gag
};

const buildCandidates = (ctx: AwardContext): AwardCandidate[] => {
  const { player, finalScore, previousBest } = ctx;
  const totalQuestions = player.totalQuestions || 0;
  const correct = player.correctAnswers || 0;
  const accuracy = totalQuestions > 0 ? correct / totalQuestions : 0;
  const hour = new Date().getHours();

  const earned: AwardCandidate[] = [
    {
      award: {
        id: 'couch-potato',
        name: '🛋️ Couch Potato Champion',
        description: 'Crowned for sheer commitment to the cushion.',
      },
      earned: true,
    },
  ];

  if (totalQuestions > 0 && totalQuestions < 8) {
    earned.push({
      award: {
        id: 'slow-and-steady',
        name: '🐢 Slow and Steady',
        description: 'Quality over quantity. Allegedly.',
      },
      earned: true,
    });
  }
  if (totalQuestions >= 20) {
    earned.push({
      award: {
        id: 'caffeinated',
        name: '⚡ Caffeinated',
        description: 'Did you breathe at all between answers?',
      },
      earned: true,
    });
  }
  if (totalQuestions >= 5 && accuracy >= 0.8) {
    earned.push({
      award: {
        id: 'sniper',
        name: '🎯 Sniper',
        description: 'Pinpoint accuracy. Are you cheating?',
      },
      earned: true,
    });
  }
  if (totalQuestions >= 5 && accuracy >= 0.25 && accuracy <= 0.4) {
    earned.push({
      award: {
        id: 'lucky-guesser',
        name: '🎲 Lucky Guesser',
        description: 'Math says you should be doing worse.',
      },
      earned: true,
    });
  }
  if (player.maxStreak >= 5) {
    earned.push({
      award: {
        id: 'on-fire',
        name: '🔥 On Fire',
        description: 'Someone get the extinguisher.',
      },
      earned: true,
    });
  }
  if (hour >= 22 || hour < 5) {
    earned.push({
      award: {
        id: 'night-owl',
        name: '🦉 Night Owl',
        description: 'Sleep is for people who lose at trivia.',
      },
      earned: true,
    });
  }
  if (player.endedOnWrong) {
    earned.push({
      award: {
        id: 'drama-queen',
        name: '🎭 Drama Queen',
        description: 'Went out swinging. Missed.',
      },
      earned: true,
    });
  }
  if (finalScore > 0 && finalScore > previousBest) {
    earned.push({
      award: {
        id: 'self-proclaimed-genius',
        name: '🏆 Self-Proclaimed Genius',
        description: 'A new personal best. Tell everyone.',
      },
      earned: true,
    });
  }

  const gags: AwardCandidate[] = [
    {
      award: { id: 'frog-whisperer', name: '🐸 Frog Whisperer', description: 'The amphibians respect you.' },
      earned: false,
    },
    {
      award: { id: 'mashed-potato', name: '🥔 Mashed Potato Enthusiast', description: 'A noble pursuit.' },
      earned: false,
    },
    {
      award: { id: 'remote-king', name: '👑 King of the Remote', description: 'The throne is yours. The batteries are not.' },
      earned: false,
    },
    {
      award: { id: 'probably-alien', name: '🛸 Probably an Alien', description: 'No human knows that much.' },
      earned: false,
    },
    {
      award: { id: 'sock-detective', name: '🧦 Sock Detective', description: 'Still investigating the dryer.' },
      earned: false,
    },
    {
      award: { id: 'snack-overlord', name: '🍿 Snack Overlord', description: 'The bowl is empty. Again.' },
      earned: false,
    },
  ];

  return [...earned, ...gags];
};

const pickRandom = <T,>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
};

/**
 * Pick 2-3 awards: prefer one earned + one gag for variety.
 */
export const pickAwards = (ctx: AwardContext): Award[] => {
  const candidates = buildCandidates(ctx);
  const earned = candidates.filter(c => c.earned).map(c => c.award);
  const gags = candidates.filter(c => !c.earned).map(c => c.award);

  const picked: Award[] = [];
  picked.push(...pickRandom(earned, Math.min(2, earned.length)));
  picked.push(...pickRandom(gags, 1));

  // De-dupe by id and cap at 3.
  const seen = new Set<string>();
  return picked.filter(a => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  }).slice(0, 3);
};
