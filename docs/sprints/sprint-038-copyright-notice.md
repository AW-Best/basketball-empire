# Sprint 038 — Copyright and Fan-Project Notice

## Goal

Add a concise, player-visible legal notice inspired by the structure used by airball.gg, while using original wording written specifically for Basketball Empire.

## Acceptance Criteria

- [x] The home experience displays a copyright notice for Basketball Empire.
- [x] The notice identifies Basketball Empire as an independent fan-made game.
- [x] The notice says the game is not affiliated with, endorsed by, or licensed by the NBA, NBPA, or any team.
- [x] The notice explains that player names are used only for entertainment and that the in-game teams, events, and results are fictional.
- [x] The notice remains readable without crowding the mobile layout.
- [x] The complete automated test suite passes.

## Architecture and UI Approach

Use a semantic global footer inside the existing arena shell so the notice is available on the mode hub, lobby, and game page without adding another dialog or JavaScript state. Style it as a low-emphasis legal strip that wraps naturally on narrow screens.

## TDD Plan

- [x] Add a failing UI contract test for the copyright and affiliation wording.
- [x] Add the semantic footer and responsive styling.
- [x] Run the UI test and the full suite.
- [x] Commit and deploy the completed change.
