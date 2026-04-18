
The user wants:
1. **Seamless question music** across a full round (no restart between questions)
2. **Smooth crossfade** from RoundIntro music → Question music

Let me look at how Question.tsx currently handles audio to understand the restart issue.
<lov-tool-use id="toolu_vrtx_01VayWDtsVW6x9qCvHXhjFb4" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Question.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01DeQZUKDo6xT1FaofMUuLRJ" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Question.tsx\"}">
</lov-tool-use>
Now I understand both files. The user wants:
1. Question music to keep playing seamlessly across questions (it already does — music is in Question.tsx and only fades out when leaving the round).
2. Intro music (RoundIntro) to crossfade smoothly into question music — no harsh break.

The harsh break happens because RoundIntro fades out its music on unmount, then Question.tsx mounts and starts a fresh fade-in. There's a gap and they don't overlap.

Solution: shared global audio context — a singleton audio manager that persists across route changes so the intro track can crossfade with the question track.

<lov-plan>
## Goal
Make audio seamless: question music should play continuously across all questions in a round (already works), and the round-intro music should **crossfade** smoothly into the question music with no harsh cut.

## Why it sounds harsh today
Each page owns its own `<audio>` element via `useRef`. When `RoundIntro` unmounts it fades its track out, then `Question` mounts and starts fading its own track in — but because the unmount fade and mount fade aren't coordinated (and React unmounts the old route before the new one's audio is ready), you get a gap and a noticeable seam.

## Fix: a tiny shared audio manager

**New file: `src/utils/audioManager.ts`**
A singleton that owns long-lived `HTMLAudioElement`s by key (`'intro'`, `'question'`) so they survive route changes. It exposes:
- `playTrack(key, src, { volume, loop })` — start a track, fading it in.
- `crossfade(fromKey, toKey, src, { volume, loop, durationMs })` — start `toKey` fading **in** while `fromKey` fades **out** *simultaneously* (true crossfade, no gap).
- `stopTrack(key, durationMs)` — fade out and pause.
- `setTrackVolume(key, volume, durationMs)` — for pause/resume dimming.

Internally it reuses the existing `fadeIn`/`fadeOut` helpers; no new fade math.

## Wiring

**`src/pages/RoundIntro.tsx`**
- Replace local `new Audio('/round-start.mp3')` with `audioManager.playTrack('intro', '/round-start.mp3', { volume: 0.5 })`.
- On unmount, **do not** stop the intro track. Instead, leave it running so `Question` can crossfade it out.

**`src/pages/Question.tsx`**
- On mount (when questions are ready), call `audioManager.crossfade('intro', 'question', '/question-music.mp3', { volume: 0.35, loop: true, durationMs: 1200 })`. This starts the question loop fading in *while* the intro track fades out over the same window — no gap, no harsh cut.
- Remove the local `musicRef` for the BGM. Question music now lives in the manager and persists across the 10 questions naturally (it already did via the same ref, but now it's even more robust).
- Pause dialog: `audioManager.setTrackVolume('question', 0, 300)` to duck; resume restores to 0.35.
- On round end / quit / unmount: `audioManager.stopTrack('question', 600)`.

**No changes** to `audioFade.ts` — it already handles cancelling in-flight fades on the same element, which is exactly what crossfade needs.

## Result
- Intro plays → user lands on first question → intro fades down while question loop fades up over ~1.2s → question loop continues uninterrupted across all 10 questions → fades out cleanly at round end / quit.
- No more page-unmount audio gap. No more abrupt starts.

## Files touched
- `src/utils/audioManager.ts` (new)
- `src/pages/RoundIntro.tsx` (use manager, don't stop on unmount)
- `src/pages/Question.tsx` (crossfade in, manager-owned BGM, pause/resume/quit via manager)
