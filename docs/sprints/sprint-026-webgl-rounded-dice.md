# Sprint 026 — WebGL Rounded Dice

## Goal

Replace the visually flat CSS dice with compact, rounded, solid dice rendered in WebGL while keeping the game accessible and usable when WebGL is unavailable.

## Architecture approval

- Render both dice in one transparent canvas to limit GPU and memory cost.
- Use Three.js `RoundedBoxGeometry` for continuous rounded edges and real lighting.
- Keep the existing DOM dice as labelled fallbacks and hide them only after WebGL initializes successfully.
- Expose a small `window.Dice3D` adapter so the existing game loop remains independent of rendering technology.
- Resolve each roll with a Promise so piece movement cannot begin before the dice settle.

## Acceptance criteria

- Dice have continuous rounded geometry, visible thickness, directional lighting, and inset pips.
- Both dice tumble, bounce, and settle on their server-provided values.
- The throw stays compact and reads clearly on desktop and mobile.
- Reduced-motion users see the final result without a tumble.
- Failed or unsupported WebGL leaves the accessible CSS dice available.
- Automated tests and the complete test suite pass before release.

## Tasks

- [x] Define architecture and acceptance criteria.
- [x] RED: add WebGL integration and settlement contract tests.
- [ ] GREEN: implement rounded dice geometry, pips, lighting, and animation.
- [ ] Verify responsive behavior and the full automated test suite.
- [ ] Commit, publish, and visually verify the hosted result.
