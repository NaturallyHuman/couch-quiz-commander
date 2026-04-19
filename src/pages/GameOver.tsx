import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TVButton } from '@/components/TVButton';
import { GameState, PlayerStats } from '@/types/game';
import { recordGameScore } from '@/utils/lifetimeStats';
import { pickAwards, Award } from '@/utils/awards';

interface CategoryRow {
  category: string;
  correct: number;
  attempted: number;
  accuracy: number;
}

const computeCategoryBreakdown = (player: PlayerStats): CategoryRow[] => {
  const attempted = player.attemptedByCategory || {};
  const correct = player.correctByCategory || {};
  return Object.keys(attempted)
    .map((cat) => {
      const a = attempted[cat] || 0;
      const c = correct[cat] || 0;
      return { category: cat, correct: c, attempted: a, accuracy: a > 0 ? c / a : 0 };
    })
    .sort((x, y) => y.accuracy - x.accuracy);
};

const GameOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const recordedRef = useRef(false);

  const gameState = location.state?.gameState as GameState;

  const [recentScores, setRecentScores] = useState<number[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isNewBest, setIsNewBest] = useState(false);

  // Record this game's score once and pick awards based on the player's stats.
  useEffect(() => {
    if (!gameState || recordedRef.current) return;
    recordedRef.current = true;

    const player = gameState.players[0];
    const finalScore = player.totalScore;
    const { stats, previousBest } = recordGameScore(finalScore);

    setRecentScores(stats.recentScores);
    setIsNewBest(finalScore > previousBest && finalScore > 0);
    setAwards(pickAwards({ player, finalScore, previousBest }));
  }, [gameState]);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const breakdown = useMemo(
    () => (gameState ? computeCategoryBreakdown(gameState.players[0]) : []),
    [gameState]
  );

  const strongest = useMemo(
    () => breakdown.filter((r) => r.attempted >= 2).slice(0, 1)[0],
    [breakdown]
  );
  const weakest = useMemo(() => {
    const eligible = breakdown.filter((r) => r.attempted >= 2);
    return eligible.length > 1 ? eligible[eligible.length - 1] : undefined;
  }, [breakdown]);

  if (!gameState) {
    navigate('/');
    return null;
  }

  const isTwoPlayer = gameState.mode === 'two-player';
  const finalScore = gameState.players[0].totalScore;
  const maxRecent = Math.max(1, ...recentScores);

  return (
    <div className="flex h-full w-full flex-col items-center overflow-y-auto px-[5%] py-[3%]">
      <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Game Over</h1>
      {isNewBest && (
        <div className="mb-4 text-lg font-semibold text-warning">🏆 New Personal Best!</div>
      )}

      {isTwoPlayer ? (
        <div className="mb-8 flex w-full max-w-[80%] items-center justify-center gap-16">
          {gameState.players.map((p, i) => (
            <div key={i} className="text-center">
              <div className="mb-1 text-xl text-muted-foreground">{p.name}</div>
              <div className="text-5xl font-bold text-primary">
                {p.totalScore.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 text-center">
          <div className="mb-1 text-lg text-muted-foreground">Final Score</div>
          <div className="text-6xl font-bold text-primary">
            {finalScore.toLocaleString()}
          </div>
        </div>
      )}

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Category breakdown */}
        <section className="rounded-2xl bg-card p-5">
          <h2 className="mb-3 text-xl font-bold text-foreground">By Category</h2>
          {breakdown.length === 0 ? (
            <p className="text-muted-foreground">No categories played.</p>
          ) : (
            <ul className="space-y-2">
              {breakdown.map((row) => {
                const isStrongest = strongest && row.category === strongest.category;
                const isWeakest = weakest && row.category === weakest.category;
                const accent = isStrongest
                  ? 'text-success'
                  : isWeakest
                  ? 'text-destructive'
                  : 'text-foreground';
                return (
                  <li
                    key={row.category}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className={`font-medium ${accent}`}>
                      {isStrongest ? '⭐ ' : isWeakest ? '💀 ' : ''}
                      {row.category}
                    </span>
                    <span className="text-muted-foreground">
                      {row.correct}/{row.attempted} ·{' '}
                      <span className={accent}>{Math.round(row.accuracy * 100)}%</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {strongest && (
            <p className="mt-3 text-sm text-muted-foreground">
              Strongest: <span className="text-success font-semibold">{strongest.category}</span>
              {weakest && (
                <>
                  {' '}· Weakest:{' '}
                  <span className="text-destructive font-semibold">{weakest.category}</span>
                </>
              )}
            </p>
          )}
        </section>

        {/* Recent scores */}
        <section className="rounded-2xl bg-card p-5">
          <h2 className="mb-3 text-xl font-bold text-foreground">Last 10 Games</h2>
          {recentScores.length === 0 ? (
            <p className="text-muted-foreground">No previous scores yet.</p>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {/* Newest is index 0; render oldest → newest left-to-right */}
              {[...recentScores].reverse().map((s, i, arr) => {
                const isCurrent = i === arr.length - 1;
                const heightPct = Math.max(4, (s / maxRecent) * 100);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t ${
                        isCurrent ? 'bg-primary' : 'bg-muted'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${s.toLocaleString()}`}
                    />
                    <span
                      className={`text-[10px] tabular-nums ${
                        isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {s >= 1000 ? `${Math.round(s / 100) / 10}k` : s}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Awards */}
        <section className="rounded-2xl bg-card p-5 md:col-span-2">
          <h2 className="mb-3 text-xl font-bold text-foreground">Awards</h2>
          {awards.length === 0 ? (
            <p className="text-muted-foreground">No awards this round.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {awards.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-border bg-background/50 p-3"
                >
                  <div className="text-base font-bold text-foreground">{a.name}</div>
                  <div className="text-sm text-muted-foreground">{a.description}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6">
        <TVButton ref={buttonRef} size="large" onClick={() => navigate('/')}>
          Play Again
        </TVButton>
      </div>
    </div>
  );
};

export default GameOver;
