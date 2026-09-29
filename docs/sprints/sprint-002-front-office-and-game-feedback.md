# Sprint 002 — Front Office and Game Feedback

## Architecture and UX decision

Keep the server authoritative for movement and payments. The server records a travelled path and a separate payment event; clients use those immutable events for animation and messaging. Front Office content is derived from the public room snapshot and does not expose private tokens. Special-space guidance is read-only and available to every player.

The visual direction extends the existing televised-basketball interface with a compact front-office drawer, courtside transaction callouts, and player-color possession lighting. Motion respects the existing reduced-motion setting.

## Acceptance criteria

- [x] Recruit, Trade, and Teams buttons open useful, distinct sections.
- [x] Recruit includes recognizable NBA player names as fan-made scouting flavor.
- [x] A revenue payment names the payer, recipient, amount, and team.
- [x] A dice move visibly advances through every intermediate square.
- [x] The landing square uses the moving player's color.
- [x] Every non-team square opens a plain-language explanation.
- [x] Desktop and mobile layouts remain usable.

## TDD implementation plan

### Task 1: Movement and payment events

- [x] Add failing game tests for movement paths and payment events.
- [x] Run the tests and confirm red.
- [x] Implement the minimum authoritative event data.
- [x] Run the tests and confirm green.

### Task 2: Front Office

- [x] Add a failing UI structure test.
- [x] Run the test and confirm red.
- [x] Implement Recruit, Trade, and Teams content.
- [x] Run the test and confirm green.

### Task 3: Motion and special-space guidance

- [x] Add failing UI tests for movement, landing color, callout, and explanations.
- [x] Run the tests and confirm red.
- [x] Implement responsive dialogs and animations.
- [x] Run the UI and full suites and confirm green.
