# Sprint 033 — Compact Responsive Dice

## Goal

Reduce the WebGL dice one more step so the throw remains readable without dominating the court center.

## Architecture approval

- Update only the shared responsive scale values.
- Keep geometry, animation, collision, contact shadow, and authoritative results unchanged and proportional.

## Acceptance criteria

- Phone dice scale is 0.41, tablet scale is 0.50, and desktop scale is 0.60.
- Pips remain readable and the two dice remain visually separate.
- Physics and shadows continue to derive from the same responsive scale.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify compact responsive scales.
- [x] GREEN: implement the compact scales.
- [x] Run the full suite and visually verify the replay.
- [x] Publish and verify production.
