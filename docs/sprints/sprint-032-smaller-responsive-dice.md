# Sprint 032 — Smaller Responsive Dice

## Goal

Reduce the WebGL dice by approximately 15% at every responsive breakpoint so they leave more of the court visible, especially on phones.

## Architecture approval

- Change only the shared responsive scale values; physics dimensions, contact shadows, and collision supports already derive from this scale.
- Preserve the canvas, animation timing, authoritative results, and accessible CSS fallback.

## Acceptance criteria

- Phone dice scale is 0.462, tablet scale is 0.571, and desktop scale is 0.68.
- Collision, floor contact, and shadows remain proportional to the rendered dice.
- The final dice remain readable without dominating the court center.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify the reduced responsive scale.
- [x] GREEN: implement the smaller dice scale.
- [x] Run the full suite and visually verify phone presentation.
- [ ] Publish and verify production.
