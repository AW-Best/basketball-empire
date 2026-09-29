# Sprint Status — Auction, History, and Team Card Polish

- [x] Requirements and acceptance criteria recorded
- [x] Architecture and UI approach approved from the existing game design
- [x] RED: add failing auction, history, affordability, dice, and card tests
- [x] GREEN: allow every active player to bid
- [x] Record point awards and recruited-player activity
- [x] Expand team cards and grey unaffordable purchases
- [x] Restore normal dice and Richup-style history emphasis
- [x] Verify the full automated test suite
- [x] Publish and restart the room server

## Sprint 007 — Render Deployment

- [x] Add a tested Render Blueprint for the Node.js service.
- [x] Document free-tier room persistence limitations.
- [ ] Create the private GitHub repository and connect it to Render.
- [ ] Verify the deployed HTTPS page and health endpoint.

## Sprint 008 — Dice, Auction, and Recruiting Fixes

- [x] RED: specify a standard animated dice roll, five-second auctions, and responsive Recruit flow.
- [x] GREEN: replay a normal dice tumble on every roll without basketball-shot effects.
- [x] Change auction start and bid-reset windows to five seconds.
- [x] Open the Scouting Board from a team card and preselect that team.
- [x] Verify the full automated test suite and commit the completed fix.

## Sprint 009 — Leave Game

- [x] RED: specify an in-game leave/new-game control and session cleanup.
- [x] GREEN: clear the saved identity, disconnect live updates, and return to Create/Join.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 010 — Lobby Rulebook

- [x] RED: specify a player-facing rulebook on the Create/Join screen.
- [x] GREEN: add a responsive in-page rulebook with the implemented game rules.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 011 — Host Game Length

- [x] RED: specify host-selected 10, 15, 20 minute, and Unlimited matches.
- [x] GREEN: enforce the selected duration through the UI, API, room service, and game engine.
- [x] Show an infinity clock for Unlimited matches and prevent automatic expiry.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 012 — Trading, Bankruptcy, and Balance Feedback

- [x] RED: specify authoritative trade offers, voluntary bankruptcy, and the new UI contracts.
- [x] GREEN: implement PTS/asset trading and recipient accept/reject controls.
- [x] Add synchronized balance-change badges, My Teams naming, and a real basketball brand mark.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 013 — Doubles Extra Roll

- [x] RED: specify that doubles grant the same player another roll after resolving the space.
- [x] GREEN: preserve and consume the server-authoritative extra-roll state.
- [x] Show `ROLL AGAIN` and record the bonus in game history.
- [x] Verify the full automated test suite and commit the completed feature.
