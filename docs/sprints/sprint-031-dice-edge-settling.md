# Sprint 031 — Dice Edge Contact and Natural Settling

## Goal

Make the WebGL dice land and collide as rounded cubes instead of invisible balls, while preserving authoritative multiplayer results.

## Architecture approval

- Derive the vertical support height from each die quaternion and its three rotated local axes.
- Use an oriented support radius along the dice-to-dice collision normal instead of one fixed circular radius.
- Delay result alignment until the final part of the throw and apply a frame-rate-independent correction rate.
- Preserve deterministic motion, responsive sizing, reduced-motion behavior, and exact server-provided final values.

## Acceptance criteria

- A rotating die changes its floor contact height as faces, edges, and corners approach the court.
- Dice-to-dice separation reflects each cube's current orientation.
- Result alignment begins late and eases into the final face without an early magnetic pull.
- Both dice end on the exact authoritative values on desktop and mobile.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify oriented floor and dice contact plus late settling.
- [x] GREEN: implement oriented support and progressive result correction.
- [x] Run the full suite and visually verify the replay.
- [x] Publish and verify production.
