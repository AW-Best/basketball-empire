# Sprint 051 — Buzzer Onboarding and Power Feedback

## Goal

Make the shooting gesture immediately understandable and make shot strength readable during every attempt.

## Architecture and UI approval

- Keep onboarding inside the existing start overlay; do not interrupt play with extra pages.
- Use a lightweight CSS loop to demonstrate drag, release, arc, and rim target.
- Keep the real power calculation authoritative in the existing launch-vector code.
- Expose power as a semantic meter with a visible percentage and charging state.
- Preserve the power meter on mobile instead of hiding it.
- Respect reduced-motion preferences by disabling the tutorial and charging loops.

## Acceptance criteria

- [x] Start screen visually demonstrates the full shooting gesture.
- [x] The guide labels Drag Back, Release, and Aim for the Rim.
- [x] Power shows a live 0–100% value while dragging.
- [x] The meter gains high-contrast charging feedback.
- [x] The power meter remains visible on narrow screens.
- [x] Reduced-motion users receive a static tutorial.
- [x] Automated UI tests cover the guide and power feedback.
