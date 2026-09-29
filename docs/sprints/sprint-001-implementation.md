# Sprint 001 — Playable Online MVP

## Acceptance criteria

- [x] Two to four named players can join a room using a room code.
- [x] Player avatars use one or two initials while full names remain visible.
- [x] All ready players can start one synchronized match.
- [x] The server controls dice, movement, turns, team signing, and revenue.
- [x] Declined teams remain unsigned and no auction is started.
- [x] Players can complete divisions, recruit stars, mortgage assets, and end a match.
- [x] Browser clients receive room updates without reloading.
- [x] The interface works on desktop and mobile screens.

## Task 1: Rules engine

**Files:**
- Create: `src/game.js`
- Replace: `test/game.test.js`

- [x] Write failing tests for board composition, player identity, match start, movement, signing, revenue, upgrades, mortgages, and scoring.
- [x] Run tests and verify the expected missing-module failure.
- [x] Implement the minimum rules engine required by the tests.
- [x] Run tests and verify green.
- [x] Refactor with tests remaining green.

## Task 2: Room service

**Files:**
- Create: `src/room-service.js`
- Create: `test/room-service.test.js`

- [x] Write failing tests for room creation, four-player capacity, readiness, start authorization, and action authorization.
- [x] Run tests and verify red.
- [x] Implement the room service.
- [x] Run tests and verify green.
- [x] Refactor with tests remaining green.

## Task 3: HTTP and real-time transport

**Files:**
- Create: `src/server.js`
- Create: `test/server.test.js`
- Create: `package.json`

- [x] Write failing HTTP tests for health, room creation, joining, and actions.
- [x] Run tests and verify red.
- [x] Implement the HTTP API, static serving, and SSE broadcasting.
- [x] Run tests and verify green.
- [x] Refactor with tests remaining green.

## Task 4: Player interface

**Files:**
- Create: `public/index.html`
- Create: `public/styles.css`
- Create: `public/app.js`
- Create: `test/ui.test.js`

- [x] Write failing structural tests for lobby, board, player rail, actions, game log, and accessible labels.
- [x] Run tests and verify red.
- [x] Implement the responsive broadcast-and-tactics-board interface.
- [x] Run tests and verify green.
- [x] Verify the rendered app manually in a browser.

### Task 4.1: Mobile play layout

- [x] Write a failing structural test for touch-friendly board scrolling, player navigation, actions, and team-card presentation.
- [x] Run the mobile layout test and verify red.
- [x] Implement the portrait and landscape mobile layouts.
- [x] Run the UI suite and verify green.
- [x] Verify a phone-sized viewport manually in a browser.

### Task 4.2: Live room interface

- [x] Write failing structural tests for create/join/share, ready/start, live state, and core turn decisions.
- [x] Run the live room interface tests and verify red.
- [x] Connect the interface to the HTTP and SSE room APIs.
- [x] Run the UI suite and verify green.
- [x] Verify two browser clients manually.

## Task 5: Release verification

**Files:**
- Modify: `README.md`
- Modify: `SPRINT-STATUS.md`

- [x] Run the full automated test suite.
- [x] Start the server, complete a two-player browser smoke test, and run a four-player full-round integration test.
- [x] Document setup, play, limitations, and test commands.
- [x] Update sprint status.
