# Sprint 049 — Floating Rim Levels

## Goal

Turn Buzzer Beater into a clear two-level shooting challenge with an unobstructed floating rim.

## Architecture and UI approval

- Keep the existing Canvas renderer and pure game-state engine.
- Store level progress in the engine so progression is deterministic and testable.
- Use one mutable hoop position for rendering, collision, and scoring.
- Keep Level 1 fixed and move the Level 2 rim horizontally with a smooth sine wave.
- Remove the backboard and support; retain a bright rim and readable net as the visual target.

## Acceptance criteria

- [x] The hoop has no backboard or support.
- [x] Level 1 requires 4 made shots within 60 seconds.
- [x] Clearing Level 1 starts Level 2 with a fresh 60-second clock.
- [x] The Level 2 rim moves left and right.
- [x] HUD shows current level and progress toward 4 makes.
- [x] Rendering, collision, and scoring share the moving rim coordinates.
- [x] Automated tests cover level completion, progression, and presentation.

## Test cases

- A new run begins at Level 1 with a 4-make goal.
- Four made shots mark the level complete.
- Level advancement resets level makes and time, while preserving the total score.
- The final level cannot advance past Level 2.
- The UI contains the level goal and floating-rim renderer without backboard drawing.
