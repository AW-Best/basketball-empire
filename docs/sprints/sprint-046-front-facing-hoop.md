# Sprint 046 — Front-Facing Hoop and Round Ball

## Goal

Make the shooting target read as a real front-facing basketball hoop and keep the basketball perfectly round at every responsive size.

## Acceptance criteria

- The backboard faces the player and contains a centered target square.
- The orange rim is drawn as a front-facing ellipse with visible depth.
- The net hangs beneath the rim with vertical and horizontal mesh lines.
- The support structure sits behind the backboard and hoop.
- The basketball remains circular on desktop and phone layouts.
- Existing shot physics and scoring geometry remain unchanged.

## Architecture and UI approval

Keep the authoritative hoop coordinates and collision model. Replace only the Canvas drawing routine and enforce a 16:10 CSS aspect ratio so X/Y scaling stays uniform. Use original vector drawing with no external assets.

## TDD checklist

- [x] RED: specify a front-facing hoop renderer and aspect-ratio-safe circular ball.
- [x] GREEN: render the front-facing backboard, elliptical rim, mesh net, and rear support.
- [x] Verify the actual responsive Canvas output in the browser.
- [ ] Run the full suite, commit, deploy, and verify production.
