# Sprint 003: Assets, Cards, and Named Recruits

## Architecture

The Node game engine remains authoritative. Routes, labs, card effects, and named recruits are resolved in `src/game.js`; `RoomService` only authenticates and forwards actions. Card events are stored in the shared game log so every connected browser displays the same reveal. The browser renders server state and sends a named recruit with the selected owned team.

## Acceptance criteria

- [x] Unowned routes and labs can be purchased through the normal sign/pass decision.
- [x] Owned routes charge 25/50/100/200 PTS based on network size.
- [x] Owned labs charge dice total ×4 for one lab or ×10 for both.
- [x] Team Operations and Game Time draw and resolve a shared card event.
- [x] Every client sees an animated card reveal.
- [x] Dice show both pips and a readable number.
- [x] Route/lab detail cards show buy, mortgage, and revenue rules.
- [x] Eight named NBA player prospects appear and can be recruited onto eligible teams.
- [x] A named prospect cannot be recruited twice in one match.

## TDD tasks

- [x] Write and run failing engine tests.
- [x] Implement asset rent, card decks, and named recruits.
- [x] Write and run failing interface contract tests.
- [x] Implement card overlay, dice pips, asset details, and recruit controls.
- [x] Run the complete suite and update this sprint record.
