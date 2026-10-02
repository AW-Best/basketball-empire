# Sprint 025 — 3D Dice Flattening Fix

## Diagnosis

The mid-roll browser capture showed both dice collapsing into thin white strips. Two effects combined:

- The trajectory wrapper repeated X/Y rotations already performed by the inner cube.
- A `filter` on the preserved-3D cube forced browsers to flatten its six faces into a single composited texture.

## Fix

- The outer die now controls only translation, scale, and light Z rotation.
- The inner cube exclusively owns X/Y tumble.
- Filters were removed from 3D ancestors; face shading and the independent tray shadow retain depth.
- Perspective was tightened and the dice spacing increased.
- Static asset versions were bumped to bypass cached CSS.

## Verification

- [x] Failing regression test observed before the fix.
- [x] Mid-roll browser screenshot shows front, top, and side faces simultaneously.
- [x] Full suite passes (124/124).
- [x] Hosted assets verified on Tailscale and Cloudflare.
