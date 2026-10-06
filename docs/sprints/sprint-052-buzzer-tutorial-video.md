# Sprint 052 — Buzzer Tutorial Video

## Goal

Make the Buzzer Beater controls understandable before the first shot by presenting a short, replayable visual lesson with a clearly recognizable basket.

## Architecture approval

- Keep the tutorial dependency-free and inside the existing Buzzer screen.
- Use semantic HTML, CSS animation, and a small replay controller rather than downloading a large video file.
- Reuse the existing reset path when a player opens the lesson during a game, so the clock never continues behind the tutorial.

## UI approval

- Present the lesson as a seven-second courtside replay with timed captions.
- Show a front-facing orange rim and a distinct white hanging net.
- Provide both an always-available **Watch How to Play** button and a **Replay Video** control.
- Keep the lesson compact on phones and respect reduced-motion preferences.

## Acceptance criteria

1. The opening tutorial visibly includes a rim and net.
2. The animation demonstrates pressing, dragging backward, releasing, and scoring.
3. Players can replay the lesson before starting.
4. Players can reopen the lesson from the game HUD.
5. Opening the lesson during play resets the challenge safely.
6. The full automated suite and a browser presentation check pass.

## Test cases

- Assert the tutorial dialog, hoop, net, replay control, and HUD entry point exist.
- Assert timed shot and caption animations exist.
- Assert replay and reopen event handlers are wired.

