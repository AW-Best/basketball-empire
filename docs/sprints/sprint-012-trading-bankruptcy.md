# Sprint 012 — Trading, Bankruptcy, and Balance Feedback

## Acceptance criteria

- [ ] Every synchronized PTS change briefly appears beside that player as a green `+N` or red `−N` badge.
- [ ] A player at 0 PTS with no mortgageable assets can declare bankruptcy; their assets return to the bank and they become inactive.
- [ ] If bankruptcy leaves one active player, that player wins. Otherwise the match continues.
- [ ] Trade is independent from Recruit and My Teams. A player selects an active rival, then proposes PTS, assets, or both from either side.
- [ ] The recipient can accept or reject a pending offer. Acceptance atomically validates and transfers PTS/assets.
- [ ] Developed, championship, or mortgaged assets cannot be traded.
- [ ] “Teams” is renamed “My Teams”.
- [ ] The Basketball Empire brand mark reads visually as a basketball with curved seams.

## Architecture approval

Keep the server authoritative. Trade offers live in shared game state and every create/accept/reject/bankruptcy command goes through the authenticated room action endpoint. The game engine performs all ownership, balance, eligibility, and winner validation atomically. The browser only renders synchronized state and submits intent.

## UI design approval

Use a separate courtside Trade Desk: offer list plus a high-contrast Create Trade button. Creation is a two-step dialog—choose rival, then build both sides of the deal with PTS inputs and asset checkboxes. Balance deltas use player colors plus conventional green/red feedback. Mobile controls remain full-width and touch-friendly.

## TDD plan

- [x] Write engine and room-service tests for trade and bankruptcy; verify RED.
- [x] Write UI contract tests for balance deltas, Trade Desk, My Teams, and basketball mark; verify RED.
- [x] Implement the minimum authoritative engine and room actions.
- [x] Implement the synchronized UI and responsive styling.
- [x] Run the full suite, update sprint status, commit, push, and deploy.
