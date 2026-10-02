# Sprint 030 — Dice Shadow and Roll Variation

## Goal

Build on the rigid-body dice simulation with height-reactive contact shadows and result-seeded launch variation for a more natural Richup.io-like throw.

## Architecture approval

- Add one inexpensive transparent contact-shadow mesh per die.
- Update shadow position, scale, and opacity from the die height every frame.
- Seed small velocity and angular-velocity changes from the authoritative result so clients replay the same motion.
- Preserve exact final faces, responsive sizing, and the existing CSS fallback.

## Acceptance criteria

- Shadows tighten and darken near the court, then widen and fade while airborne.
- Different dice results produce subtly different launch and rotation motion.
- The same result remains deterministic across clients.
- Both dice still collide and settle on the correct server-provided values.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify dynamic contact shadows and deterministic variation.
- [x] GREEN: implement shadows and seeded motion.
- [x] Run the full suite and visually verify the replay.
- [ ] Publish and verify production.
