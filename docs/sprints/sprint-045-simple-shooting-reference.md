# Sprint 045 — Simple Shooting Reference Pass

## Goal

Refine Buzzer Beater using the clarity and arena energy of Basketball REAL as a visual reference, while keeping Hoopire's game original and limited to a simple swipe-to-shoot challenge.

## Acceptance criteria

- The game remains a one-action shooting challenge with no player selection, passing, dunks, teams, upgrades, or match simulation.
- The start screen clearly says that players swipe to shoot.
- The court gains a stronger diagonal arena perspective, focused rim target, crowd, and lighting while preserving the existing physics.
- Phone, tablet, mouse, and pointer controls remain unchanged.
- All graphics remain original Canvas/CSS artwork.

## Architecture approval

Keep the existing engine, scoring, timer, input events, and Canvas coordinate system. Restrict this iteration to presentation helpers in `buzzer-beater.js` and copy in `index.html`; no dependencies or backend changes.

## UI approval

Use the reference only for high-level visual cues: a broadcast-like diagonal hardwood court, crowded arena depth, a clear rim focal point, and immediate score feedback. Do not reproduce its characters, uniforms, interface layout, artwork, or branding.

## TDD checklist

- [x] RED: specify the simple shooting-only UI contract and required arena rendering helpers.
- [x] GREEN: add the presentation copy, perspective court, arena lights, and rim target.
- [x] Run the complete suite (163 passing) and verify the live Canvas composition with the existing responsive layout.
- [x] Commit, deploy, and verify the refinement on `hoopire.com`.
