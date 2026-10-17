# Skinned athlete and contact-correct dunk

## /po /sm scope and acceptance criteria
Replace v9 stretching primitive athlete with a coherent rigged humanoid and a natural, original single-hand dunk. Keep bubble gameplay/scoring and mobile render budgets unchanged. Use the Quaternius Universal Base Characters CC0 skinned mesh, source/provenance saved locally, restyle into a blue/teal street uniform. No celebrity likeness or remote runtime assets.

1. A genuine SkinnedMesh and bone hierarchy drive the body with quaternion rotations and immutable bone offsets/scales; arm/leg lengths invariant over all sampled frames. No resizing limb meshes to targets.
2. A baked AnimationClip/Skeleton animation covers approach steps, planted gather, takeoff, airborne ball swing, rim contact, release, landing compression and recovery. Original authored motion; do not claim mocap. Fixed-length two-bone IK for contact targets; plant foot world drift<2cm while supporting body.
3. Ball follows the shooting palm with a stable offset until release, then crosses rim/net once. No stretched reaching, ball teleport or intersection through rim/backboard; landing soles on court and knees flex before recovery.
4. Local model <1.5MB, scene<25k triangles and<75 mesh draw calls. Maintain DPR/pixel cap/idle and slow-device pacing, background pause, preview isolation, reset cancellation, 2D fallback and one impact/clear.
5. Actual browser phase review (approach/gather/rise/rim/landing) at phone aspect; visual review plus numerical skeleton/contact invariants, not just old event tests. Only deploy after verified improvement.

## Proposed /arch and /ui design
Load local CC0 GLB with vendored same-version GLTFLoader. Keep street scene static and replace only athlete creation with a skinned-player module. Bone motion authored against real rest skeleton with fixed offsets and two-bone chains. Bake quaternion+root translation into a named clip, sample with AnimationMixer at current normalized dunk time (existing clock controls impact). Body/costume uses vertex colors and a few bone-attached hair/uniform details; no heavy textures or post effects. Add unit regressions for invariant segment lengths, planted support feet and ball/rim continuity using the real loaded asset. Offline Node parse of GLB supports tests; local Three.js loader dependencies only. Animation timing may be adjusted, with a tested mapping from logical impact to new clip. Existing failure/victory controls unchanged.

## Approval / review
Independent /arch and /ui approved before implementation. Independent /rev approved fixed offset/quaternion sampling, actual bone-world contacts, hand-ball continuity and mobile budgets; suggested timeout and skeleton-disposal improvements were added via observed red/green tests and re-reviewed as passing. Child browser connection was unavailable for independent visual review; primary developer completed actual browser playback QA.

## Validation
239 regression tests pass. Eight new actual-asset tests exercise65bones and121-frame baked clip samples; real model is741,320bytes. Complete Node scene budget17,544triangles/33mesh draw objects (browser adds three lettering planes).
Actual local390×844 browser playback checked gather/rise/impact/recovery, with a closer camera and realistic basketball radius. The continuous skin, jersey and sneakers are readable; support foot/gather and knee-compressed landing now visibly replace the old stretching cylinders. Actual bubble play charged to100; a real dunk updated score02, progress1/3, cleared bottom row once, consumed energy to0 and unlocked input. Preview left counters unchanged.320×568 impact view remained in viewport; reset restored score0, energy0,30shots and idle pose. Browser console reported no errors. Physical mobile FPS remains device-dependent; pixel cap, instancing and adaptive frame pacing are retained.

## Official example reference and production verification
Reviewed Three.js official skinning blending demo (including walk-to-run crossfade) and IK demo: https://threejs.org/examples/webgl_animation_skinning_blending.html and https://threejs.org/examples/webgl_animation_skinning_ik.html . Follow the fixed skeleton/quaternion animation and contact-target approach; retain a small original continuous dunk clip for mobile. No external demonstration model or motion copied.
Production v10 rendered with the new skin and actual preview rim-contact screenshot checked. Initial cold loading fell back to 2D; loader/model preload now reduces the module waterfall, and a renderer-error diagnostic makes future fallback reasons observable. Recovery remains covered by a timeout/fallback test.241 tests pass.
