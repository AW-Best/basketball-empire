# Sprint 022 — 60-Second Quick Start Guide

## Goal

Replace the dense first impression of the Player Rulebook with an optional, visual five-step onboarding flow that teaches a new player the core game loop in about one minute while keeping the complete rulebook available.

## Acceptance criteria

- The lobby presents a clear `How to Play` entry before room creation.
- A five-step, basketball-broadcast-style guide explains the goal, turns, assets, recruiting/trading, and payments/auctions.
- Players can move backward, move forward, skip, or open the full rulebook.
- The final step offers direct Create Room and Join Room actions.
- `Don't show again` is saved locally and respected without blocking invite links or saved sessions.
- The guide supports keyboard focus, dialog semantics, reduced motion, and a touch-friendly mobile layout.
- A `How to Play` control remains available during a live game.

## Architecture and UI design

- Keep onboarding client-only because it is explanatory UI and has no effect on authoritative game state.
- Reuse the existing native dialog model and local storage, with one state index driving all slides.
- Use an arena-tunnel visual direction: oversized condensed numbers, a half-court diagram, orange/cyan accents, and a compact broadcast progress rail.
- Keep the existing detailed Player Rulebook as the reference layer behind the quick guide.

## Task 1: Define the guide contract

**Files:**
- Modify: `test/ui.test.js`
- Modify: `docs/sprints/sprint-022-quick-start-guide.md`

- [x] **Step 1: Write failing UI contract tests**
- [x] **Step 2: Run the UI test and verify the expected failure**

## Task 2: Implement the responsive onboarding

**Files:**
- Modify: `public/index.html`
- Modify: `public/app.js`
- Modify: `public/styles.css`
- Modify: `SPRINT-STATUS.md`

- [x] **Step 1: Add the guide markup and navigation**
- [x] **Step 2: Add persistence, create/join shortcuts, and live-game access**
- [x] **Step 3: Add responsive arena styling and reduced-motion behavior**
- [x] **Step 4: Run the UI test and full test suite**
- [x] **Step 5: Commit and publish the completed guide**
