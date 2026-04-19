
Small, contained change to `src/pages/Question.tsx`.

## Changes

**1. Remove the score block from the header row**
The middle of the header currently shows `Score: 4,850` plus the floating `+100 / +50 bonus` popup. Remove the whole `<span>` containing "Score:" and its popup. Keep category on the left and streak/streak-lost flash on the right.

**2. Replace the question-number badge (center of D-pad) with the live score**
Currently the D-pad center circle shows `attemptedCount + 1`. Swap it to show `score.toLocaleString()` — no label, just the number. Make the badge slightly wider so 4-digit scores fit comfortably (e.g., `min-w-20 px-3` instead of fixed `w-14`).

**3. Move the score popup to the badge**
Re-anchor the floating `+100 (+50 bonus)` popup so it pops out of the center badge instead of the removed header score. Same animation, same colors — just a new parent.

**4. Question counter**
The TimerBar already shows `questionNumber` in its own pill (top of screen), so removing it from the center is fine — the count is still visible up top.

## Files touched
- `src/pages/Question.tsx` — header row trim, center badge swap, popup re-parent.

No other files, no new dependencies, no logic changes to scoring.
