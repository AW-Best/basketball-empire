# Sprint 058 — Tutorial Ball Effects

## Goal

Make the tutorial basketball visually match the ball feedback players see in the live Buzzer Beater game.

## Architecture approval

- Reproduce the canvas game's effects with lightweight CSS layers inside the existing tutorial.
- Keep every layer on the shared 7.2-second tutorial timeline.
- Restart the new layers through the existing replay control and respect reduced-motion preferences.

## UI approval

- Preserve the basketball's dimensional highlight and rotating seams.
- Show an expanding pulse around the basketball after each demonstrated tap.
- Leave restrained grey smoke puffs along its repeated-tap flight path.
- Render a floor shadow that becomes smaller and lighter as the ball climbs.

## Acceptance criteria

1. Each tutorial tap produces a ball-centered pulse.
2. The animated ball leaves a visible grey smoke trail.
3. A floor shadow responds to the ball's height and horizontal movement.
4. The new effects do not obscure the TAP control, captions, or hoop.
5. Replay and reduced-motion behavior include every new effect.

## Test cases

- Assert pulse, smoke, and ball-shadow elements are present.
- Assert each visual layer has a dedicated animation.
- Assert four smoke particles are styled along the flight path.
