# Sprint 018 — Weighted 3D Dice Motion

## Goal

Give Basketnopoly's dice a more physical, exciting throw inspired by the timing observed in Richup: changing faces, asymmetric 3D rotation, staggered bounces, and a clear final settle before the token starts moving.

## Acceptance criteria

- Both dice rapidly change faces while airborne.
- The dice use different trajectories and rotation axes rather than moving in sync.
- Each die bounces and settles on its server-authoritative final value.
- Player movement begins only after the dice have settled.
- Reduced-motion users see the final values immediately.
- The result remains pip-only and accessible.

## Architecture and UI decision

Keep authoritative dice values unchanged. The browser temporarily renders cosmetic random faces during a 1.05-second animation, restores the server result, and then invokes the existing step-by-step movement animation.

## TDD checklist

- [x] RED: specify changing faces, asymmetric 3D throws, settle, and movement ordering.
- [x] GREEN: implement the timed render sequence and physical CSS motion.
- [x] Verify the complete automated suite.
- [x] Verify the live game.
