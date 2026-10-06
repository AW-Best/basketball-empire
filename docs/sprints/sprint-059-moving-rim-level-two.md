# Sprint 059 — Moving-Rim Level 2

## Goal

Continue Buzzer Beater after the warm-up with a second, more challenging level built around a moving basket.

## Architecture approval

- Keep level state and deterministic hoop motion in the shared Buzzer Beater engine.
- Advance only after the current four-make target is complete.
- Reset the per-level clock and make count while preserving the run's total score, attempts, makes, and best streak.
- Use the same calculated hoop geometry for drawing, rim collision, backboard collision, and scoring.

## UI approval

- Preview Level 2 in the tutorial as “MOVING RIM”.
- Show a prominent level-transition callout after Level 1.
- Move the side-view basket vertically so its motion is readable on narrow phones.
- Keep the existing repeated-tap control and 1/2/3-point scoring system.

## Acceptance criteria

1. Level 1 still requires four makes within 60 seconds.
2. Completing Level 1 automatically starts Level 2 instead of ending the run.
3. Level 2 starts with 60 seconds and zero level makes.
4. The Level 2 rim moves smoothly within a bounded vertical range.
5. Completing four Level 2 makes ends the challenge.
6. Running score and statistics continue across both levels.

## Test cases

- Assert a new game exposes two levels.
- Assert advancing from a completed Level 1 produces Level 2 with a fresh clock.
- Assert Level 1 has no hoop offset.
- Assert Level 2 hoop movement changes over time and never exceeds its range.
- Assert the UI uses the authoritative level and moving-hoop functions.
