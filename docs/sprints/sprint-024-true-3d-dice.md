# Sprint 024 — True 3D Dice

## Goal

Replace the flat-card dice illusion with tactile six-sided cubes inspired by the fast, readable physicality of Richup.io.

## Acceptance criteria

- Each die has six independently transformed faces with real CSS perspective and depth.
- Top, side, front, and back faces become visible during a roll instead of a flat square flipping in space.
- The throw separates trajectory motion from cube rotation and includes impact, rebound, shadow, and final settle.
- The server-authoritative result remains visible on the front face after settling.
- Pip-only accessibility and reduced-motion behavior remain intact.
- Updated assets bypass old browser caches.

## Architecture and visual design

- Keep the existing outer `.die` as the trajectory body.
- Add a preserved-3D `.die-cube` with six `translateZ` faces.
- Render the final value on the front face and plausible values on the remaining faces.
- Animate each inner cube independently from its outer ballistic path.
- Use warm white material, different face lighting, inset bevels, and contact shadows for tactile depth.

## Verification

- [x] New 3D cube contract failed before implementation.
- [x] UI suite passes after implementation.
- [x] Full suite passes (123/123).
- [x] Production assets verified on both Tailscale and Cloudflare.
