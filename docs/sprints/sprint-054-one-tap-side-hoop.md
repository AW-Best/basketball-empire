# Sprint 054 — One-Tap Side-Hoop Level 1

## Goal

Rebuild the first Buzzer Beater challenge around the supplied side-view reference: one tap launches a fixed shot, the basket changes sides after every make, and four baskets clear the level within 60 seconds.

## Architecture approval

- Keep the existing canvas game and leaderboard API; replace only the shot-control and Level 1 gameplay loop.
- Put deterministic launch, scoring classification, and side switching in the testable game engine.
- Keep collision rendering and animation in the browser controller.
- Limit this sprint to Level 1 so later levels can add difficulty without complicating the introductory controls.

## UI approval

- Use a portrait side-view court with a visible rim, backboard, net, ball trail, and tap hint.
- Remove the drag gesture, shot-power meter, and timing bar.
- Show the scoring system beside the game: normal +1, bank +2, and swish +3.
- Update the animated tutorial to demonstrate a single tap and the alternating basket position.

## Acceptance criteria

1. Tapping anywhere in the game launches one fixed-trajectory shot.
2. A normal basket awards 1 point, a bank shot 2 points, and a swish 3 points.
3. The basket switches between the left and right sides after a made shot.
4. A missed shot keeps the basket on the same side for the retry.
5. Four made baskets within 60 seconds clear Level 1.
6. The existing Top 5 leaderboard and nickname/Anonymous result flow remain available.
7. The responsive game, automated tests, and browser play-through pass.

## Test cases

- Assert the three shot classifications award exactly 1, 2, and 3 points.
- Assert a tap returns a fixed mirrored launch vector for each side.
- Assert the basket-side helper alternates left and right.
- Assert the Level 1 page has no power meter or drag instructions.
- Assert the portrait side-court, scoring key, tutorial, and four-make target are present.

