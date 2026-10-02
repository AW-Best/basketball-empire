# Sprint 035 — Stable Dice Faces

## Goal

Make each physical die face visually stable during a roll, make final-result alignment easy to follow, and prevent WebGL initialization from replacing the real result with 1 + 1.

## Architecture approval

- Synchronize `room.lastRoll` into the WebGL renderer whenever the room UI renders.
- Initialize WebGL from the accessible fallback dice values instead of a hard-coded result.
- Replace the late exponential correction with a longer smoother-step orientation blend that reaches the authoritative quaternion without a final snap.
- Increase pip disc size and contrast slightly for the newly reduced dice dimensions.

## Acceptance criteria

- Loading a finished room shows its real last roll rather than 1 + 1.
- The final face transition is continuous and reaches the exact server result before movement begins.
- Pips remain distinguishable at the compact phone scale.
- Every physical face keeps its fixed pip layout throughout the roll.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: specify result synchronization, smooth orientation blending, and stronger pips.
- [x] GREEN: implement the minimum synchronization and rendering changes.
- [x] Run the full suite and visually verify repeated rolls.
- [ ] Publish and verify production.
