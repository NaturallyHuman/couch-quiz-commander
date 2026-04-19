
Three changes, all small.

## 1. Preload questions during RoundIntro (skip "Loading questions…")

**File: `src/pages/RoundIntro.tsx`**
- Call `selectQuestions(...)` on mount alongside the audio/timer.
- Hold the fetched questions in a ref/state.
- Pass them through to `/question` via `location.state`: `{ gameState, preloadedQuestions }`.
- Edge cases:
  - If the 5s timer fires before the fetch resolves, wait for the fetch (don't navigate yet) so we never land on the Question screen empty. Track with a `readyRef` + small effect that navigates as soon as both "timer done" and "questions loaded" are true.
  - If fetch errors, navigate home (same as Question.tsx does today).

**File: `src/pages/Question.tsx`**
- If `location.state.preloadedQuestions` is present, skip the fetch and use them directly.
- Keep the existing fetch path as fallback (in case Question is reached without preload, e.g. dev nav).
- The "Loading questions…" branch becomes effectively unreachable in the normal flow, but stays as a safety net.

## 2. Replace timer countdown number with hourglass icon

**File: `src/components/TimerBar.tsx`**
- Remove the `{timeRemaining}` numeric span on the left.
- Replace with `<Hourglass />` from `lucide-react` (`h-6 w-6`, muted color normally, `text-destructive animate-pulse` when `isLow`).
- Keep the bar itself unchanged structurally — direction change handled in step 3.

## 3. Move score to upper right + reverse progress bar direction

**Score relocation — `src/pages/Question.tsx`:**
- Wrap the existing TimerBar row so it becomes a single horizontal row:
  ```
  [hourglass] [============ progress bar ============] [score]
  ```
- Remove the centered "Score:" label/strip below the bar.
- Score shows just the number (`{score.toLocaleString()}`) in `font-bold text-foreground tabular-nums text-2xl`, no "Score:" prefix.
- Streak indicator + score popup move with the score (right side, stacked or inline beside it). Keep the popup absolute-positioned relative to the score number.
- Category name stays where it is (centered above the question) OR moves to a small line below — keeping it centered above question for now since user didn't ask to move it.

**Reverse bar animation — `src/components/TimerBar.tsx`:**
- Currently the filled portion shrinks from right to left as time drains (width goes 100% → 0%, anchored left).
- "Reverse direction" = the bar should drain from the **left** instead (filled portion shrinks toward the right, or equivalently the empty portion grows from the left).
- Implementation: anchor the fill to the right edge using `ml-auto` on the inner div, so as `width` shrinks, it stays pinned right and the left side empties first.

  ```tsx
  <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary flex">
    <div
      className={cn('h-full ease-linear ml-auto', { ... })}
      style={{ width: `${percentage}%` }}
    />
  </div>
  ```

## Files touched
- `src/pages/RoundIntro.tsx` — preload questions, navigate when both ready.
- `src/pages/Question.tsx` — accept preloaded questions; new top row layout (hourglass + bar + score); remove old score strip.
- `src/components/TimerBar.tsx` — swap number for Hourglass icon; right-anchor the fill so it drains left-first.

No new dependencies (Hourglass is already in lucide-react). No type/route changes.
