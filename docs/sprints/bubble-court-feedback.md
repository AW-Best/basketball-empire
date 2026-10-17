# Bubble Court: clear feedback and dunk rescue

## Acceptance criteria
- Matching 3+ balls bursts in their colors; detached balls fall with their original colors; energy motes and capped particle counts convey charging.
- A full bar activates +2 dunk and spends energy once. At rim impact only the deepest occupied row clears, without generating new energy.
- No firing or second dunk during animation; in-flight balls block dunk. Preview never mutates board or score.
- Reset cancels pending clear. Background-tab timer fallback cannot clear twice.
- Existing tap/drag release controls, danger line, replay and precision panel remain.

## Architecture and design review
Existing engine owns row removal and activation guards. App owns pending impact and reset lifecycle. EventBus ROW_CLEAR drives effects independently of gameplay. No new runtime dependencies, accounts or network APIs. This is a static-mode-only change.
Review completed before implementation: extend existing modules, preserve shot physics/scoring, use per-cell color snapshots before mutation. UI design: gold horizontal sweep on dunk impact, cyan energy travel on normal matches, mild flash, staggered bursts; reduced-motion avoids bursts/flash and particles remain bounded.

| Relevant design area | Before | After target |
|---|---|---|
| Color accuracy | 3 | 4 |
| Particle feedback | 3 | 4 |
| Gameplay / visual connection | 2 | 4 |
| Animation pacing | 3 | 4 |
Other scene identity/layout retained; full 3D court explicitly deferred to a separate art/animation pass.

## Tests and review
Observed three new tests fail before implementation, then green: lowest occupied row, activation guards, non-energy dunk feedback. Existing tests cover reduced motion, particle caps, energy cap, danger boundary and mobile input. Manual review covers canceled pending impact, duplicate impact prevention, color preservation, cache-version consistency, and no new external resources.
