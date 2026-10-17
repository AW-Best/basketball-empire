# Standalone two-player poster dunk study

## /po /sm scope and acceptance
- An independent mobile/desktop scene at /bubble-court/dunk-lab/, leaving the v12 game untouched.
- Existing CC0 Quaternius models only, plus the already documented free CMU basketball source and original paired choreography. No paid, scraped, or NBA assets.
- Readable approach / plant / rise / rim / stagger / brace phases. Defender lands on a foot, makes recovery steps, lowers into a seated brace; no whole-body plank rotation.
- Both hands reach fixed pavement targets when supporting the body. Fixed bone offsets/scales and grounded shoes. Attacker flexes knees at takeoff and landing; ball follows actual hand then drops through rim.
- Simple gray ground and functional studio illumination, no glow, particles, shake, cinematic lights, audio or gameplay changes.
- Play/pause/replay, 0.25/0.5/1x speed, scrubber, side/three-quarter view and winner swap. No auto-loop jump cuts.
- Mobile bounded DPR/pixels and two independently owned skeletons; loading/error UI and context-loss notice.
- Visual-first iteration per user's request to see the effect before automated tests. Actual browser inspection and static role review before publication; no automated test pass claimed.

## /arch /ui proposed implementation
New lab files only. Existing player actor provides skin/material ownership, neutral rig reset and CMU clip sampling. Bake two synchronized original full-body clips once from authored posture/contact keys, use Three.js AnimationMixer for playback and quaternion interpolation, with two-bone IK for ankle and palm constraints during authoring. Player root transforms only translate/yaw; torso/head, upper/lower limbs articulate independently. Stage motion in one shared clock and fixed world contact coordinates.

Functional bright neutral lighting and visible ground/grid, large landscape stage on desktop / tall stage on phones, controls below canvas. Camera presets do not orbit during playback. Backboard/rim remain visible; the support post is omitted to avoid occluding bodies in the study. Contact markers and skeleton view can expose mistakes rather than conceal them. Publication isolated from existing game.

## Review
Architecture/UI approved by design_review: deterministic absolute-time sampling, reachable fixed-length IK, independently articulated stumble, full-body phone framing, and truthful asset provenance.

## Implementation / review
- New five-file lab only; existing v12 game and source actor module unchanged. Reuses original CC0 mesh and CMU-derived approach, with original paired defensive choreography and contact constraints. No newly acquired motion capture or paid asset.
- Shape-preserving cubic keys keep planted ankles/palms fixed. Bake241 samples per actor once into full-body clips; AnimationMixer samples both against the same absolute6s timeline. Root never tips the whole defender over.
- Ball is attached to sampled grip until release, then follows a downward arc and two diminishing bounces. Defender support centres settle3.5cm above the pavement to account for mesh thickness.
- Desktop side controls avoid scrolling the stage when selecting beats. Compact phone layout keeps primary controls below the stage; camera fits the full movement bounds.
- /rev reviewed resource ownership, sampling, roles, ball release and mobile render budget. Identified bfcache pagehide disposal issue: fixed to retain live resources on persisted pagehide and reset timing on pageshow.
- Local real browser: desktop,390×844,320×568; key dunk and support poses, replay, view switch and identity swap inspected. JavaScript syntax checked; no automated suite run per user's visual-first instruction. No real-device FPS benchmark claimed.

- Review fix confirmed by design_review: persisted pagehide retains GPU resources, pageshow resets time; sampled hand-grip release keeps the ball continuous. /rev and /ui passed with no remaining blockers.
