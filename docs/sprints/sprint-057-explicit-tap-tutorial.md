# Sprint 057 — Explicit Tap Tutorial

## Goal

Make the Buzzer Beater tutorial clearly demonstrate the actual interaction: press the control, see the basketball rise, release and watch it fall, then press again before it drops too far.

## Architecture approval

- Keep the tutorial as CSS animation so it remains fast and deterministic on phones.
- Use one shared 7.2-second timeline for the ball, finger, button, ripple, captions, and progress bar.
- Include the new animated elements in replay and reduced-motion handling.

## UI approval

- Display a physical-looking orange TAP control inside the demonstration.
- Compress and illuminate the control on every simulated press.
- Emit a visible ripple on each press and synchronize the finger movement.
- Let the ball visibly fall between impulses instead of following one uninterrupted arc.
- Label the phases as “PRESS → RISE”, “RELEASE → FALL”, and “PRESS AGAIN”.

## Acceptance criteria

1. The tutorial visibly presses the TAP control at least twice.
2. The basketball rises immediately after each press.
3. The basketball falls between presses.
4. Captions explicitly explain press, rise, release, fall, and repeat.
5. Replay restarts every animated element together.
6. Reduced-motion users receive a stable tutorial presentation.

## Test cases

- Assert the tutorial contains the TAP control and press ripple.
- Assert all three interaction captions are rendered.
- Assert button and ripple keyframes exist.
- Assert the ball timeline includes separate rise and fall positions.
