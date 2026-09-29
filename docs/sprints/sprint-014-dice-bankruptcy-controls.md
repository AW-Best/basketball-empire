# Sprint 014 — 3D Dice and Visible Bankruptcy Control

## Acceptance criteria and design

- [ ] Both dice use a white, rounded 3D form with black pips inspired by the supplied reference.
- [ ] Dice show pips only; no small numeric label appears.
- [ ] The Bankruptcy button is always visible in My Franchise.
- [ ] Bankruptcy remains disabled with a clear explanation until the player has 0 PTS and no mortgageable assets.
- [ ] The existing server-side bankruptcy validation remains authoritative.

The visual direction is a tactile tabletop die: ivory top face, soft grey lower face, a narrow side face, deep ambient shadow, and solid black pips. The red bankruptcy control stays visible as a serious franchise action without implying it is always available.

## TDD plan

- [x] Write and run failing UI tests.
- [x] Implement the dice rendering and bankruptcy button state.
- [x] Run the full suite, commit, push, and deploy.
