

## Plan: Replace API Questions with Database-Backed Question Bank

### What We're Building
A local database of 300+ trivia questions across 5 categories (Movies, Science, History, Sports, General) with 3 difficulty levels (easy, medium, hard). Questions won't repeat until a player has completed at least 10 full games (30 questions/game = 300 unique questions needed).

### Database Changes

**New `questions` table:**
- `id` (uuid, primary key)
- `category` (text) — Movies, Science, History, Sports, General
- `difficulty` (text) — easy, medium, hard
- `text` (text) — the question
- `choices` (text[]) — array of 4 answer options
- `correct_index` (integer) — index of correct answer (0-3)

RLS: public read access (no auth required for a quiz game).

**Seed data:** ~300+ questions across all 5 categories, roughly 20+ per category per difficulty level. Will use an AI model to generate high-quality, varied trivia questions.

### Code Changes

1. **`src