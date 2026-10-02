# Sprint 036 — Richup-Style Roll and Token Movement

## Goal

Reproduce the movement rhythm observed in the live Richup match: the dice finish settling first, then the player token travels one block at a time with a short hop, a visible trail, a small pause through corners, and a clear final landing.

## Architecture and UI approval

- Keep the server-provided `roll.path` authoritative; animation never calculates a different destination.
- Keep dice and token movement sequential by starting movement only after `Dice3D.roll()` resolves.
- Drive token movement from one documented motion profile so desktop and mobile use the same rhythm.
- Use CSS transforms and opacity only for the hop/trail treatment to avoid expensive layout animation.
- Respect `prefers-reduced-motion` by moving directly to the authoritative final block.

## Acceptance criteria

- Dice settle before the token starts moving.
- The token visibly visits every block in `roll.path` in order.
- Each visited block receives a brief colored trail using that player's color.
- The token performs a compact hop on each step and a stronger final landing.
- Corner blocks get a short pacing pause without changing the result.
- Reduced-motion users see the final position immediately.

## Tasks

- [x] Record requirements, acceptance criteria, architecture, and UI direction.
- [x] RED: specify the shared motion profile, hop/trail states, and corner pacing.
- [x] GREEN: implement the minimum movement-sequence changes.
- [x] Run the full automated test suite.
- [x] Commit the completed sprint.
