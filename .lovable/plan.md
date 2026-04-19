
Restructure `src/pages/GameOver.tsx` to match the reference layout: big "Final Score" label + number at top, tier name centered in mid-upper area, and a 3-column stat row at the bottom (Best streak / Best category / Worst category). Use theme colors and clear visual hierarchy — no confetti dots, no tier ladder, no percentile, no "pts to next tier".

## Layout (mirrors uploaded reference)

```text
                 Final Score          ← label, muted, small
                   2,400              ← huge primary, tabular

                Quick Thinker!        ← tier name, accent color

   Best streak     Best category     Worst category    ← labels muted
       8              History            Science       ← values, bold
   2300 points!        9/9                3/9          ← sub-line muted

              [ Play Again ]  [ Home ]
```

## Changes in `src/pages/GameOver.tsx`

**1. Replace top section**
- Drop celebration glow + confetti dots (cleaner, matches reference).
- Keep "QUIZ COMPLETE" eyebrow (small, muted, tracked) — adds hierarchy without clutter.
- "Final Score" label (text-lg, muted-foreground, font-medium).
- Score number: text-8xl, font-bold, tabular-nums, `text-primary`, `animate-scale-in`.

**2. Tier name (mid section)**
- Centered, text-4xl, font-bold, `text-success` (or `text-primary` — pick `text-success` for color contrast vs the score). Add "!" suffix to match reference energy ("Quick Thinker!").
- Margin top/bottom generous (~mb-16) to give the breathing room shown in the reference.

**3. Three-column stat row**
Replace the inline horizontal stats + tier ladder with a clean 3-col grid:
- **Best streak** → value: `player.maxStreak`, sub-line: `${maxStreak * 100} points!` (approximation — or compute actual streak bonus if available). Looking at PlayerStats, there's no per-streak bonus total stored; simplest: show "{maxStreak * STREAK_BONUS_PER} points!" using the same constant as scoring, OR just "best run!" sub-line. **Decision**: use `${player.maxStreak * 100} points!` as a readable approximation matching reference's "2300 points!" vibe. (If exact value is preferred, we can wire `streakBonusTotal` through GameState later.)
- **Best category** → value: existing `getBestCategory(player)` result, sub-line: `${correct}/${attempted}` from `correctByCategory` / `attemptedByCategory`.
- **Worst category** → new helper `getWorstCategory(player)` mirroring `getBestCategory` but picking lowest accuracy (min 2 attempts). Sub-line: `${correct}/${attempted}`.

Each column: muted label on top, large bold value middle (text-2xl, with best=success, worst=destructive for color coding), muted sub-line below.

**4. Action buttons**
- Keep `Play Again` (primary) + `Home` (secondary), centered at bottom with mt-12. Keep D-pad focus on Play Again.

**5. Remove**
- TIERS ladder rendering (keep `TIERS` array + `getTierIndex` for the tier name only).
- Percentile line + recentScores tracking display (keep the recording call to `recordGameScore` so lifetime stats still update — just don't show percentile).
- Confetti dots + celebration glow divs.
- "pts to next tier" line.

## Theme color usage
- Score number: `text-primary`
- Tier name: `text-success`
- Best stat values: `text-foreground` with best category in `text-success`
- Worst category value: `text-destructive`
- All labels and sub-lines: `text-muted-foreground`
- Buttons keep existing TVButton variants

## Files touched
- `src/pages/GameOver.tsx` — full layout rewrite per above. No new files, no scoring logic changes, no type changes.
