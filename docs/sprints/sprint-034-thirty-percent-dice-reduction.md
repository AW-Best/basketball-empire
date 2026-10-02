# Sprint 034 — Thirty Percent Dice Reduction

## Goal

Reduce the current WebGL dice by exactly 30% at every responsive breakpoint.

## Architecture approval

- Change only the shared responsive scale values from 0.41/0.50/0.60 to 0.287/0.35/0.42.
- Continue deriving geometry physics, floor support, collision footprint, and contact shadows from the shared scale.

## Acceptance criteria

- Phone scale is 0.287, tablet scale is 0.35, and desktop scale is 0.42.
- Dice animation and authoritative results remain unchanged.
- Pips remain distinguishable at the smaller size.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify the exact 30% reduction.
- [x] GREEN: implement the new responsive scales.
- [x] Run the full suite and visually verify the replay.
- [ ] Publish and verify production.
