# Sprint 048 — Straight-On End-Court Camera

## Goal

Match the supplied composition more closely: the player looks straight down the court at a front-facing basket, with the audience behind it and court lines converging toward the hoop.

## Acceptance criteria

- The basket remains centered and front-facing, not shown from above or from the side.
- The audience fills the background behind the backboard.
- A clear court horizon separates the stands from the hardwood.
- The painted key, free-throw circle, center-circle edge, and floorboards converge toward the basket.
- The basket is larger and visually dominant enough to aim at on a phone.
- No reference-game characters, artwork, uniforms, or interface assets are copied.

## Architecture and UI approval

Keep the existing physics coordinates, input model, and Canvas scaling. Replace only the arena composition helpers with original procedural crowd and straight-on court drawing.

## TDD checklist

- [x] RED: specify the straight-on court horizon, larger centered hoop, crowd bowl, and replacement renderer.
- [x] GREEN: implement the original crowd bowl and end-court perspective.
- [x] Verify the real responsive Canvas output against the requested composition.
- [x] Run the full suite (166 passing), commit, deploy, and verify production.
