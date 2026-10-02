# Sprint 037 — Calmer Dice Spin and Wider Spacing

## Goal

Make the dice easier to read by reducing excessive rotation and increasing the resting and rolling space between them without making either die larger.

## Architecture and UI approval

- Keep the current WebGL rigid-body system and authoritative final faces.
- Define shared launch/rest spacing constants so the dice cannot drift back to cramped positions.
- Scale angular velocity rather than removing rotation, preserving a physical roll with fewer revolutions.
- Reduce collision-added spin so impacts do not reintroduce frantic rotation.
- Preserve all existing responsive die sizes.

## Acceptance criteria

- Dice retain a visible 3D tumble but rotate substantially less.
- Resting dice centers are wider apart than before.
- Dice launch with enough separation to remain visually distinct during the roll.
- Final faces and mobile sizing remain unchanged.
- The rendered resting gap remains clearly visible after perspective projection; the dice edges do not touch.

## Tasks

- [x] Record requirements, acceptance criteria, architecture, and UI direction.
- [x] RED: specify calmer angular velocity and wider launch/rest positions.
- [x] GREEN: implement the revised WebGL motion constants.
- [x] Verify the full test suite and commit.
