# Sprint 056 — Video-Style Mid-Play Interaction

## Goal

Bring the middle of Buzzer Beater closer to the supplied video by making taps feel tactile and keeping the same basketball alive as the basket switches sides after a score.

## Architecture approval

- Represent the post-score transition as a deterministic engine operation.
- Preserve the scoring ball's position and recent trail rather than spawning a replacement ball.
- Stop horizontal motion briefly while the ball falls through the net, then target the opposite side on the next tap.
- Keep visual feedback as lightweight canvas state so no image or animation dependency is added.

## UI approval

- Show a short expanding ring on each tap.
- Replace the orange trail with soft grey smoke puffs like the reference.
- Add a height-sensitive floor shadow beneath the basketball.
- On a make, briefly flash the court, kick the net sideways, and float the awarded points above the rim.
- Keep all effects restrained enough to preserve aiming visibility on phones.

## Acceptance criteria

1. A made ball visibly continues down through the basket.
2. The basket changes sides without replacing the ball.
3. The next tap redirects the same ball toward the new basket.
4. Every tap has a brief pulse and smoke-trail response.
5. Every make has a flash, net reaction, and floating points response.
6. The existing timer, scoring rules, level target, and leaderboard remain unchanged.

## Test cases

- Assert the post-make helper returns the opposite side while preserving ball position.
- Assert post-make motion becomes a controlled vertical drop and retains recent trail points.
- Assert the browser no longer calls the old score-time ball reset.
- Assert tap pulse, score flash, floor shadow, and floating score rendering are present.
- Browser-play a make followed by another make using the continuing ball.

