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
- [x] Run the full suite, publish, and verify the live auction.

## Sprint 020 — Cloudflare Workers Runtime

- [x] Tag the current Node.js baseline as `v0.1.0-node`.
- [x] Record the Workers, Assets, and Durable Objects architecture.
- [x] RED: specify Cloudflare routing, persistent rooms, API compatibility, and polling fallback.
- [x] GREEN: implement the Worker and SQLite-backed `BasketballRoom` Durable Object.
- [x] Add Wrangler local-development and deployment commands.
- [x] Verify static assets plus create/join room behavior in `wrangler dev`.
- [x] Deploy to the user's Cloudflare account and verify the public URL.

## Sprint 021 — Short Cloudflare Worker URL

- [x] Record requirements, acceptance criteria, and the service-rename approach.
- [x] RED: require the Wrangler Worker name to be `play`.
- [x] Rename the existing Worker service without replacing its Durable Object storage.
- [x] GREEN: update Wrangler and pass the deployment plus full test suites.
- [x] Publish through GitHub and verify the shortened public URL.

## Sprint 022 — 60-Second Quick Start Guide

- [x] Record acceptance criteria, architecture, and the arena-tunnel visual direction.
- [x] RED: specify the five-step guide, navigation, persistence, and mobile behavior.
- [x] GREEN: implement the lobby and live-game How to Play experience.
- [x] Verify the full suite, publish, and check the Cloudflare deployment.

## Sprint 023 — Dice Motion, Trade Alerts, and Short Games

- [x] Record acceptance criteria, architecture, and court-impact motion direction.
- [x] RED: specify dice phases, recipient alerts, and 3/5-minute validation.
- [x] GREEN: implement all three features across UI, Node, and Cloudflare.
- [x] Verify, publish, and check production.

## Sprint 024 — True 3D Dice

- [x] Define six-face cube structure and physical motion acceptance criteria.
- [x] RED: prove the flat dice fail the six-face 3D contract.
- [x] GREEN: implement perspective cubes, independent rotation, lighting, and impact depth.
- [x] Verify, publish, and check production.

## Sprint 025 — 3D Dice Flattening Fix

- [x] Reproduce the paper-thin mid-roll frame in the live browser.
- [x] RED: protect against competing wrapper rotations and 3D-flattening filters.
- [x] GREEN: isolate trajectory motion from cube rotation and preserve the 3D subtree.
- [x] Publish and verify both hosted versions.

## Sprint 026 — WebGL Rounded Dice

- [x] Define architecture and acceptance criteria.
- [x] RED: add WebGL integration and settlement contract tests.
- [x] GREEN: implement rounded dice geometry, pips, lighting, and animation.
- [x] Verify the full suite, publish, and visually check both hosted versions.

## Sprint 027 — Dice Physics Polish

- [x] Define architecture and acceptance criteria.
- [x] RED: specify compact rigid motion, staggered settling, and inset pips.
- [x] GREEN: implement the revised geometry and motion.
- [x] Verify, publish, and visually check the hosted versions.

## Sprint 028 — Mobile Dice Sizing

- [x] Define architecture and acceptance criteria.
- [x] RED: specify phone/tablet WebGL scaling and a smaller phone tray.
- [x] GREEN: implement responsive sizing.
- [x] Verify, publish, and visually check production.

## Sprint 029 — Rigid-Body Dice Motion

- [x] Define architecture and acceptance criteria.
- [x] RED: specify gravity, floor contact, friction, collision, and authoritative settling.
- [x] GREEN: implement lightweight rigid-body dice physics.
- [x] Verify, publish, and visually check production.

## Sprint 030 — Dice Shadow and Roll Variation

- [x] Define architecture and acceptance criteria.
- [x] RED: specify dynamic contact shadows and deterministic variation.
- [x] GREEN: implement shadows and seeded motion.
- [x] Publish and visually check production.

## Sprint 031 — Dice Edge Contact and Natural Settling

- [x] Define architecture and acceptance criteria.
- [x] RED: specify oriented cube contact and late result settling.
- [x] GREEN: implement quaternion-aware support and progressive correction.
- [x] Verify, publish, and visually check production.

## Sprint 032 — Smaller Responsive Dice

- [x] Define architecture and acceptance criteria.
- [x] RED: specify a further 15% responsive size reduction.
- [x] GREEN: update the shared dice scale.
- [x] Verify, publish, and visually check production.

## Sprint 033 — Compact Responsive Dice

- [x] Define architecture and acceptance criteria.
- [x] RED: specify compact responsive scales.
- [x] GREEN: implement the compact scales.
- [x] Verify, publish, and visually check production.

## Sprint 034 — Thirty Percent Dice Reduction

- [x] Define architecture and acceptance criteria.
- [x] RED: specify the exact 30% scale reduction.
- [x] GREEN: implement the new responsive scales.
- [x] Verify, publish, and visually check production.

## Sprint 035 — Stable Dice Faces

- [x] Define architecture and acceptance criteria.
- [x] RED: specify result synchronization, smooth correction, and compact pips.
- [x] GREEN: implement stable face presentation.
- [x] Verify locally and visually check the synchronized result.
- [x] Publish and verify production.

## Sprint 036 — Richup-Style Roll and Token Movement

- [x] Record the observed dice-to-token movement sequence and acceptance criteria.
- [x] RED: specify the shared motion profile, hop/trail states, and corner pacing.

- [x] GREEN: implement block-by-block movement polish.
- [x] Verify the full automated test suite and commit.

## Sprint 037 — Calmer Dice Spin and Wider Spacing

- [x] Record motion requirements and UI direction.
- [x] RED: specify reduced spin and wider separation.
- [x] GREEN: implement WebGL dice motion tuning.
- [x] Verify the full automated test suite and commit.

## Sprint 038 — Copyright and Fan-Project Notice

- [x] Record acceptance criteria and the semantic-footer approach.
- [x] RED: specify the copyright, independence, and fictional-content notice.
- [x] GREEN: add the global responsive legal footer.
- [x] Verify the complete 143-test suite.
- [x] Commit and publish the notice.

## Sprint 039 — Google AdSense Foundation

- [x] Record acceptance criteria, deployment architecture, and consent responsibility.
- [x] RED: specify the publisher script, ads.txt, privacy notice, and footer link.
- [x] GREEN: add the AdSense and privacy assets without changing gameplay.
- [x] Verify all 145 tests, commit, deploy, and check the public endpoints.

## Sprint 040 — AdSense Verification Hardening

- [x] Confirm production serves the correct script and ads.txt to all Google crawler identities.
- [x] RED: specify alternate meta verification and explicit crawler access.
- [x] GREEN: add the verification metadata and robots.txt.
- [ ] Verify, commit, deploy, and recheck production.
