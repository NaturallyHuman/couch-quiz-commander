

## Part A — Fix scoring bugs in `src/pages/Question.tsx`

**Bug: `navigate()` fires during a `setTimeRemaining` updater**, causing the React warning and enabling double-execution of `handleRoundEnd` (which mutates `players[0].totalScore` via `+=`). This is the most likely cause of "scoring isn't working properly" — scores can be added twice or mid-update.

**Fix:**
1. In the timer interval, when `prev <= 1`, schedule `handleRoundEnd` with `setTimeout(handleRoundEnd, 0)` instead of calling synchronously inside the updater. Return `0` immediately.
2. Replace the in-place mutation in `handleRoundEnd` with an immutable update — build a new `players` array with a new player object (`...currentPlayer, totalScore: currentPlayer.totalScore + score, ...`). This makes a duplicate call idempotent because the second call is short-circuited by `roundEndedRef.current` BEFORE any mutation, and there's no shared mutable state to corrupt across rounds anyway.
3. Keep the existing `roundEndedRef` guard (already present, good).

**Bug: dead seed values** — Question.tsx seeds local `score`/`streak` from `gameState.currentRoundScore` etc., but those are always reset to 0 by `handleRoundEnd` before navigation. Harmless but confusing. Leave as-is to keep this PR small.

## Part B — `src/pages/GameOver.tsx` layout fit

Viewport: 16:9 inside ~995×559 px. Current card has too many stacked sections with generous padding → overflow. Tighten to fit comfortably:

1. **Card padding**: `px-12 py-10` → `px-10 py-6`. Width `max-w-3xl` → `max-w-2xl` to match shorter content.
2. **Score size**: `text-8xl` → `text-7xl`, `mb-5` → `mb-3`.
3. **Rank badge**: `text-2xl py-2` → `text-xl py-1.5`, `mb-2` → `mb-1`.
4. **Percentile**: `mb-8` → `mb-5`.
5. **Ladder**: `mb-3` → `mb-2`; tier label text already `text-xs`, fine.
6. **Distance to next**: `mb-8` → `mb-4`.
7. **Stats row**: `mb-10 text-base` → `mb-6 text-sm`.
8. **Buttons**: keep `size="large"` but remove the outer `animate-pulse` wrapper that adds visual height; rely on focus ring.
9. **Confetti dots + glow**: keep but reduce glow size from `600px` → `400px` so it doesn't dominate.
10. **Outer wrapper**: change `py-[3%]` → `py-[2%]` and `px-[5%]` → `px-[3%]` so the card has more breathing room within the 16:9 frame.

## Part C — Background change

Currently `src/index.css` body uses `--gradient-bg` (purple→dark gradient).

1. In `src/index.css`, change `body { background: var(--gradient-bg); }` to `body { background: hsl(0 0% 0%); }` (pure black, full viewport).
2. Remove the `--gradient-bg` token (or leave defined but unused — leave defined for safety in case other components reference it).
3. Confirm no other components rely on `--gradient-bg` via a search; if any do, leave the token defined.

## Files touched
- `src/pages/Question.tsx` — defer round-end navigation, immutable player update.
- `src/pages/GameOver.tsx` — tighten paddings, font sizes, and margins; smaller glow; drop pulse wrapper.
- `src/index.css` — body background → solid black.

No new dependencies. No type changes. No routing changes.

