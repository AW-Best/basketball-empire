# Sprint 027 — Dice Physics Polish

## Goal

Refine the WebGL dice from a showy airborne animation into a compact, rigid tabletop roll closer to the observed Richup.io presentation.

## Architecture approval

- Keep the existing Three.js renderer and game-loop adapter.
- Tune geometry, camera, materials, and animation without changing authoritative game state.
- Give each die an independent settle time and angular path while resolving the shared roll only after both stop.
- Use layered pip geometry to create an inset visual without adding an expensive runtime boolean-geometry dependency.

## Acceptance criteria

- Both dice remain fully inside the central composition on narrow screens.
- The roll stays low, travels laterally, rebounds briefly, and ends with a short slide.
- Dice remain rigid throughout the animation with no squash or stretch.
- The two dice rotate and settle at different times.
- Pips read as recessed through a dark well and inner core.
- Reduced-motion and CSS fallback behavior remain unchanged.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify compact geometry, rigid motion, staggered settling, and inset pips.
- [x] GREEN: implement the revised geometry and motion.
- [x] Run the full suite and visually verify desktop and mobile.
- [x] Publish and verify the hosted version.
