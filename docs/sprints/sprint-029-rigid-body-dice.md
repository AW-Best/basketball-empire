# Sprint 029 — Rigid-Body Dice Motion

## Goal

Close the remaining gap with Richup.io by replacing the scripted dice path with a lightweight rigid-body simulation while preserving server-authoritative results.

## Architecture approval

- Keep Three.js and implement a small two-body integrator instead of adding a large physics dependency.
- Simulate gravity, floor restitution, horizontal friction, angular velocity, and an approximate dice-to-dice collision.
- Calculate the correct resting height from the responsive scale so dice sit on the court rather than float.
- Blend only the final settling phase toward the server-provided face values.

## Acceptance criteria

- Dice follow gravity and bounce off the court with energy loss.
- Horizontal travel slows through friction rather than a fixed easing curve.
- The two dice exchange momentum when they meet.
- Dice sit on the floor at every responsive size.
- Both dice settle on the exact server-provided values before movement starts.
- Reduced-motion and CSS fallback behavior remain unchanged.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify rigid-body integration, floor contact, friction, collision, and authoritative settling.
- [x] GREEN: implement lightweight dice physics.
- [x] Run the full suite and visually verify the roll.
- [x] Publish and verify production.
