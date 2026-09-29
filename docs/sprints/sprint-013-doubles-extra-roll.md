# Sprint 013 — Doubles Extra Roll

## Acceptance criteria and architecture

- [ ] When both dice show the same number, the player resolves the landing space normally, then keeps the next roll.
- [ ] A non-double roll advances to the next active player as before.
- [ ] The shared game history announces the earned extra roll.
- [ ] The roll control says `ROLL AGAIN` when the current player has earned an extra roll.

The server remains authoritative: it records `extraRollPending` from the verified dice and consumes it only in `endTurn`. This preserves all decision and auction phases before the bonus roll.

## TDD plan

- [x] Write and run failing engine/UI tests.
- [x] Implement the minimal engine and UI changes.
- [x] Run the full suite, commit, push, and deploy.
