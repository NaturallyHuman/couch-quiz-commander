
The user wants three changes:

1. **Remove the countdown transition screen** — that's `RoundTransition.tsx`. Need to find what navigates to `/round-transition` and route directly to the next destination instead.

2. **Randomize question categories** — currently questions are filtered by selected category. User wants variety per round regardless. Need to check `questionSelector.ts` and how category is passed.

3. **Center arrow icons in answer choices** — arrow icons shift based on answer text length. Need to check `AnswerChoice.tsx` layout.

Let me explore.
