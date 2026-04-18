
## Plan: TV-First Polish, Mixed Categories, Transition Cards & Slim Game Over

### 1. Lock TV aspect ratio (always 16:9, no scrolling)
- `src/index.css`: keep the `#root` 16:9 letterbox sizing but remove `overflow: auto` so content never scrolls — TVs can't scroll. Use `overflow: hidden`.
- `src/pages/Question.tsx`: replace its own `min-h-screen` + `aspect-video` wrapper with the same `h-full w-full` pattern other pages use, so it inherits the global 16:9 stage instead of fighting it.
- All page content already uses `px-[5%] py-[3%]` safe-area — keep that, but cap font sizes so they fit at 720p without wrapping awkwardly.

### 2. Clean answer choices (no borders/backgrounds, no overlap with D-pad)
- `src/components/AnswerChoice.tsx`: strip the border, background, backdrop-blur, and padding box. Render as plain large text. Keep state styling via **text color + subtle glow only**:
  - default: `text-foreground`
  - highlighted/selected: `text-primary` with soft text-shadow glow
  - correct: `text-success`
  - incorrect: `text-destructive` with strikethrough
- Remove `min-h-[80px]` box; let it size to text.
- `src/pages/Question.tsx`: widen the D-pad layout so the four answers sit clearly at top / left / right / bottom of the central D-pad icon with comfortable spacing, and shrink answer width so they no longer visually collide with the arrow icons. The arrows stay as the only visual "frame."

### 3. Replace round-end button with a 5-second randomized transition card
- New page: `src/pages/RoundTransition.tsx`
  - Shows for 5 seconds, then auto-navigates to the next `/round-intro` (or `/turn-transition` for two-player, or `/game-over` if last round).
  - Picks one random message from a pool, e.g.:
    - "Not bad… but it's about to get harder. Think you can keep up?"
    - "Nice warm-up. The real challenge starts now."
    - "You're doing great — let's crank up the difficulty."
    - "Easy round done. Brace yourself."
    - "Solid! But the next round won't go easy on you."
    - "Hope you were just warming up. It's getting tougher."
  - Big centered text, subtle countdown ring or fading dots, no buttons. Pressing Enter can skip early (TV-friendly).
- `src/App.tsx`: register `/round-transition` route.
- `src/pages/Question.tsx` `moveToNext()`: instead of going to `/results`, go to `/round-transition` carrying the same payload (score, gameState, etc.).
- Skip the transition (go straight to game-over) if the round just finished is the last round.

### 4. Force mixed categories every round
- DB already has **20 questions × 5 categories × 3 difficulties = 300**. No new questions needed unless user wants more.
- Remove the category-selection step from the flow:
  - `src/pages/Home.tsx`: after choosing Solo / Two Players, navigate **straight to `/round-intro`** with `category = 'Mixed'` (skip `/category`).
  - Keep `CategorySelect.tsx` file but unroute it (or just stop navigating to it). Simpler: delete the `/category` route from `App.tsx`.
- `src/utils/questionSelector.ts`: treat `'Mixed'` (and existing `'All'`) the same — no category filter, pull from all 5 categories. Existing shuffle already randomizes order across categories.
- `RoundIntro.tsx`: show "Mixed Trivia" instead of category name.

### 5. Slim down Game Over screen
- `src/pages/GameOver.tsx`: replace the entire stat/badge/rank block with a minimal layout:
  - Title: "Game Over"
  - Big number: final score (for two-player, show both players' scores side by side, just name + score)
  - Single button: **Play Again** → navigates to `/` (or directly starts a new game with same mode)
  - Remove: Trophy icon block, Award/Zap stats, percentage, badges, rank, "View Stats" button, "Home" button.

### 6. Files touched
- Edit: `src/index.css`, `src/components/AnswerChoice.tsx`, `src/pages/Question.tsx`, `src/pages/Home.tsx`, `src/pages/RoundIntro.tsx`, `src/pages/Results.tsx` (becomes unused or thin pass-through — will remove its route usage), `src/pages/GameOver.tsx`, `src/App.tsx`, `src/utils/questionSelector.ts`
- Create: `src/pages/RoundTransition.tsx`
- No DB changes (300 questions across 5 categories already seeded)

### 7. Flow after changes
```text
Home → (Solo/2P) → RoundIntro (Mixed) → Question x10
   → RoundTransition (5s, randomized message)
   → RoundIntro (next round) → Question x10
   → RoundTransition → ...
   → GameOver (score + Play Again)
```
