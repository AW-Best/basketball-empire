# Sprint 017 — Basketball Empire Game-Mode Hub

## Goal

Turn Basketball Empire into a multi-mode game shell and make the existing board game its first playable mode, **Basketnopoly**.

## Acceptance criteria

- A normal visit opens a Basketball Empire mode-selection screen.
- Basketnopoly is clearly labeled as playable and opens the existing Create Room / Join Room experience.
- Other future modes are visibly marked as coming soon and cannot be entered.
- The Basketnopoly lobby has a Back to Modes control.
- Room invitation links continue directly to Basketnopoly's Join Room form with the code filled in.
- A saved active session continues directly to its lobby or match.
- Leaving a room returns to the game-mode hub.
- The mode screen remains usable on phone-sized screens.

## Architecture and UI decision

Keep the existing single-page application and add a lightweight client-side screen state (`mode`, `lobby`, or `game`). No route or API changes are required. The Basketball Empire identity stays global; Basketnopoly receives its own featured mode card and lobby label.

## TDD checklist

- [x] RED: add failing mode-hub and navigation contract tests.
- [x] GREEN: implement the hub, navigation, and invite/session bypass.
- [x] Verify targeted and full automated tests.
- [x] Publish and verify the live page.
