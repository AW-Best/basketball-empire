# Sprint 047 — Top Hoop and Upward Shooting

## Goal

Place the hoop at the top center of the court so every shot travels naturally from the player's lower position toward the basket.

## Acceptance criteria

- The hoop and backboard are centered at the top of the Canvas.
- New balls rotate through lower-left, lower-center, and lower-right positions.
- Players may shoot upward from any of the three positions; horizontal direction is not artificially restricted.
- The court perspective, spotlight, key, and target label align with the centered hoop.
- Existing scoring, timer, streak, and collision behavior remains active.

## Architecture and UI approval

Retain the existing 2D projectile engine and authoritative scoring plane. Change only world coordinates, launch validation, and court rendering anchors. This keeps the interaction simple and avoids adding a player-character system.

## TDD checklist

- [x] RED: specify centered top hoop, bottom shooting positions, and unrestricted horizontal launch.
- [x] GREEN: update geometry, perspective anchors, and launch validation.
- [x] Verify a real bottom-to-top drag shot in the responsive browser view.
- [ ] Run the full suite, commit, deploy, and verify production.
