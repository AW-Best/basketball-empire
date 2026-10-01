# Sprint 023 — Dice Motion, Trade Alerts, and Short Games

## Goal

Make rolling feel physical and exciting, ensure trade recipients cannot miss an offer, and support fast 3- and 5-minute games.

## Acceptance criteria

- Dice launch separately with visible depth, mid-air tumble, court impact, rebound, and a clean final settle before movement starts.
- The animation remains pip-based, respects reduced motion, and never changes the server-authoritative result.
- A newly received pending trade displays a recipient-only notification with the sender and offer summary.
- Selecting the notification opens the Trade desk; dismissing it does not alter the offer.
- Each offer is announced only once per browser session unless a different offer arrives.
- Hosts can select 3, 5, 10, 15, 20 minutes, or Unlimited; Node and Cloudflare enforce the same values.

## Architecture and UI design

- Keep dice animation client-side and start board movement only after the result settles.
- Detect incoming offers by comparing synchronized room snapshots with a local last-notified offer key.
- Keep trade acceptance server-authoritative; the alert is only a navigation surface.
- Extend the existing duration validation map in both runtimes.
- Visual direction: televised court impact—deep perspective, separated trajectories, contact flash, elastic rebound, and controlled settle.

## Task 1: RED contracts

**Files:**
- Modify: `test/ui.test.js`
- Modify: `test/room-service.test.js`
- Modify: `test/cloudflare-worker.test.js`

- [x] Write failing dice, trade-alert, and short-duration tests.
- [x] Run focused tests and confirm expected failures.

## Task 2: GREEN implementation

**Files:**
- Modify: `public/index.html`
- Modify: `public/app.js`
- Modify: `public/styles.css`
- Modify: `src/room-service.js`
- Modify: `cloudflare/worker.mjs`
- Modify: `SPRINT-STATUS.md`

- [x] Implement the improved dice sequence.
- [x] Implement recipient-only synchronized trade alerts.
- [x] Add and enforce 3- and 5-minute game lengths.
- [x] Run the full suite and verify desktop/mobile layout contracts.
- [x] Commit, publish, and verify production.
