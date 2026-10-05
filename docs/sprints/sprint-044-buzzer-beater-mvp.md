# Sprint 044 — Buzzer Beater MVP

## Goal

Add a genuinely playable single-player 60-second shooting challenge to the Hoopire game-mode hub.

## Acceptance criteria

- Buzzer Beater is selectable from the existing mode hub and can return there without reloading.
- Mouse, pen, and touch users can pull back on the ball, see aim/power feedback, and release to shoot.
- The ball follows gravity and responds to the backboard, rim, floor, and world boundaries.
- A make counts only when the ball travels downward through the hoop after being above it; one shot can score once.
- Two-point and three-point shots, the last-ten-seconds double bonus, streaks, attempts, makes, and best streak are tracked.
- The 60-second game ends cleanly, shows a result card, saves a local high score, and supports replay.
- The responsive interface works at phone and desktop widths and honours reduced-motion preferences.
- All artwork is original CSS/Canvas rendering with no real teams, players, leagues, or uniforms.

## Architecture approval

Keep the existing static application and Cloudflare asset deployment. Add a dependency-free pure rules module (`buzzer-beater-engine.js`) shared by browser code and Node tests, plus a Canvas controller (`buzzer-beater.js`). No backend or room protocol changes are required for the single-player MVP.

## UI design approval

Use a focused “final possession under arena lights” composition: broadcast HUD, warm hardwood court, dark crowd, orange basketball, red clutch clock, and bold condensed typography. The canvas stays central and preserves a 16:10 playfield while the surrounding HUD collapses for phones.

## TDD checklist

- [x] Requirements, architecture, and UI direction recorded.
- [x] RED: specify rules, scoring, timer, shot detection, navigation, and responsive UI.
- [x] GREEN: implement the playable challenge.
- [x] Refactor the hidden-canvas and mobile-overlay regressions found during browser testing.
- [x] Run the complete suite after final documentation updates (162 passing).
- [ ] Manually verify desktop and mobile layouts (mobile gameplay verified; desktop remains).
- [x] Commit the MVP implementation as a reviewable first batch.
