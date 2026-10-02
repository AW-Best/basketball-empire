# Sprint 028 — Mobile Dice Sizing

## Goal

Keep both WebGL dice comfortably inside the central court on phones without reducing desktop readability.

## Architecture approval

- Scale the WebGL dice by viewport breakpoint rather than maintaining separate geometry.
- Reapply the responsive scale after resize and throughout a roll.
- Reduce the phone canvas footprint while preserving the existing desktop composition and CSS fallback.

## Acceptance criteria

- All breakpoint sizes are reduced by a further 20% after visual review.
- Phones at 720px or below render dice at 54.4% of the original desktop size.
- Tablets render dice at 67.2%; desktop renders them at 80%.
- The two dice remain fully visible with space around their edges.
- Resize, reduced-motion, and animated states use the same responsive scale.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify phone/tablet WebGL scaling and the smaller phone tray.
- [x] GREEN: implement responsive dice sizing.
- [x] Run all tests and visually verify the phone layout.
- [ ] Publish and verify production.
