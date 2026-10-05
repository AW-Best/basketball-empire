# Sprint 043 — IP Risk Reduction

## Goal

Remove the three highest-priority identity risks from the active Basketball Empire product while preserving gameplay and saved-room compatibility.

## Acceptance criteria

- The playable mode is presented as **Dynasty Circuit** and the retired name does not appear in active HTML or JavaScript.
- All eight recruitable prospects use original fictional names in both the server rules and browser UI.
- Active team names and locally drawn logo symbols avoid official NBA branding; `Capital Kings` becomes `Capital Crowns`.
- The legal notice states that all in-game teams and players are fictional.
- Automated tests prevent the retired name, listed real players, external logo images, and the conflicting team name from returning.

## Architecture and compatibility

This is a data-and-copy-only change. Room APIs, board indexes, prices, player ratings, and saved asset IDs remain unchanged. The renamed team stays on `space-9`, so existing room state remains structurally compatible.

## UI design

Keep the existing Basketball Empire visual system and mode-card layout. Replace only the mode/team text and the crown symbol identifier; no new interaction or layout is introduced.

## TDD checklist

- [x] RED: add product-content regression tests and update feature expectations.
- [x] GREEN: replace the active names, copy, and matching logo identifier.
- [x] Run the complete test suite (154 passing).
- [x] Deploy and verify the public site at `hoopire.com`.
