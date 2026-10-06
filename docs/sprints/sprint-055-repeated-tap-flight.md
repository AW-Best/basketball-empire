# Sprint 055 — Repeated-Tap Ball Flight

## Goal

Correct Level 1 to match the supplied gameplay video: one tap gives the live basketball one upward boost, and the player must keep tapping to guide it into the side basket.

## Architecture approval

- Keep one continuous ball in play during each attempt.
- Apply gravity every frame and allow input while the ball is already moving.
- Make every tap reset the vertical velocity to one consistent upward impulse while maintaining horizontal travel toward the active basket.
- Count one shot only when the ball scores or the complete attempt misses; taps are controls, not separate shot attempts.

## UI approval

- Spawn the ball near basket height, as shown in the supplied portrait reference.
- Use a smoke trail to make the stepped flight path readable.
- Replace all “tap once” and “fixed shot” language with “tap to lift” and “keep tapping.”
- Animate several visible boosts in the tutorial instead of one automatic arc.

## Acceptance criteria

1. The first tap starts the ball moving toward the active basket.
2. Every later tap during the same attempt gives the ball another upward boost.
3. Gravity pulls the ball down between taps.
4. A repeatable four-tap rhythm can score on both right and left baskets.
5. A completed make or miss counts as one shot regardless of tap count.
6. Existing Level 1 scoring, timer, side switching, and leaderboard behavior remain intact.

## Test cases

- Assert every tap produces the same mirrored horizontal speed and upward impulse.
- Assert a later tap resets the falling ball's upward speed.
- Assert browser input does not reject taps while the ball is in flight.
- Assert the tutorial and game copy describe repeated tapping.
- Browser-play the same four-tap rhythm into both right and left baskets.

