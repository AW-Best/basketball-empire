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

## Sprint 014 — 3D Dice and Visible Bankruptcy Control

- [x] RED: specify pip-only 3D dice and an always-visible bankruptcy control.
- [x] GREEN: implement tactile white dice and disabled-state bankruptcy guidance.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 015 — Full Auction Overlay

- [x] RED: specify the synchronized auction overlay and asset details.
- [x] GREEN: implement current bid, countdown progress, bid totals, history, and asset card.
- [x] Verify responsive behavior, run the full suite, and commit.

## Sprint 016 — Dismiss Event Cards

- [x] RED: specify a local close control for Team Ops and Game Time cards.
- [x] GREEN: add the accessible × button and cancel the reveal timer when used.
- [x] Run the full suite and commit.

## Sprint 017 — Basketball Empire Game-Mode Hub

- [x] Record acceptance criteria and the single-page screen-state design.
- [x] RED: specify the mode hub, Basketnopoly entry, and invite/session bypass.
- [x] GREEN: add the responsive mode selector and lobby navigation.
- [x] Run the full suite, publish, and verify the live page.

## Sprint 018 — Weighted 3D Dice Motion

- [x] Record the observed movement pattern and acceptance criteria.
- [x] RED: specify face cycling, separate trajectories, bounce, and settle timing.
- [x] GREEN: implement the improved dice throw.
- [x] Run the full suite, publish, and verify the live game.

## Sprint 019 — Auction Layer Regression Fix

- [x] Diagnose the nested stacking-context collision from the supplied screenshot.
- [x] RED: require the auction to live at the page modal root.
- [x] GREEN: move and isolate the auction overlay above all game content.
- [ ] Run the full suite, publish, and verify the live auction.
