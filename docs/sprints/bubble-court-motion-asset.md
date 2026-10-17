# Complete dunk asset, transitions and dusk lighting

## /po vision and /sm acceptance criteria
Replace code-authored dunk poses with a licensed complete authored/captured basketball dunk motion on the existing CC0 athlete. User explicitly requested actual animation validation before deploying to hoopire.com.

1. Source a full approach/takeoff/dunk/landing clip; record source, license and edits. Do not relabel old procedural motion as imported or mocap. Paid candidate needs user budget approval and actual file access.
2. Retarget offline onto existing rest skeleton, bake animation-only data locally (no FBX conversion at runtime). Preserve bone offsets/scales and street outfit. Fix grip/rim/ground contacts after retargeting.
3. Idle→approach→dunk→landing→idle transitions must be smooth, including consecutive previews and reset; no root teleport. Use a world-space return/reposition phase or coherent ending/start clips.
4. Dusk lighting should reveal face, jersey and body volume: balanced hemisphere fill, warm key, restrained cool rim and soft contact shadow. No post-processing or dynamic shadow map required.
5. Keep bounded rendering (240k pixels / DPR1.5, adaptive60→30, idle15), scene<25k triangles/<75mesh draws. Background pause, reduced motion, 2D fallback, preview isolation and one clear event remain intact.
6. Failing regression tests before implementation. Actual playback phase checks at390×844 and320×568, hand/ball/rim/feet checks with real imported clip, console check and full suite before commit. Publish only after imported animation passes visual QA.

## Proposed /arch and /ui design
Use an offline conversion/retargeting script to bake a compact clip against the current GLB. Runtime animation resource loader feeds the existing AnimationMixer. Keep game clock and scoring separate from clip duration; add an explicit phase map for rim contact. Extend idle/transition treatment through model API and clock, keep court event contract. Store lighting palette/intensities in Constants.js and preserve instanced static environment. Frame-budget controls remain unchanged. Source acquisition is in progress, so clip-specific retarget mapping and duration are not yet selected.

## Acquisition state
Mixamo public library basketball search exposes only Dribble, not a complete dunk. CMU free library includes basketball dribble/shoot/layup but a complete dunk is not yet verified. TurboSquid #1919049 is a concrete US$3.99 FBX/Maya full dunk candidate; user budget question pending and browser access has a CAPTCHA. No paid asset acquired or used.

## Review / validation
/arch and /ui approved before implementation. Free-source adaptation approved with explicit layup provenance. /rev caught a return source-loop seam; observed failing quaternion test, removed the source wrap, rebaked and passed. Camera bounds and return/ankle boundary regressions also passed. Final browser verification and deployment pending.

## Selected free motion
User explicitly restricted this revision to free assets. Acquired the official CMU124_06 Basketball Lay Up ASF/AMC sequence (694frames at120fps). Runtime contains a219,883-byte baked241-sample animation, adapted into a dunk with contact correction and an authored return jog. No paid asset was acquired. Provenance, original hashes, embedded-use conditions and rebuild command are in public/bubble-court/assets/CREDITS.md.

## Implementation and red/green evidence
Added Acclaim parser tests for units/degree axes/omitted channels and actual complete source motion. New retarget tests failed before the parser/retargeter/runtime asset existed, then passed. Additional tests reproduced world-space return snap, active-preview restart, ball pickup omission, source-loop quaternion seam and serial model/motion loading; each was repaired and green. A separate lighting test verified three unshadowed lights and a smooth procedural contact texture. New camera projection regression checks captured feet throughout the motion at mobile court aspect. Legacy authored-pose regressions remain additional backwards-compatibility coverage; new actual imported-clip tests establish current motion behavior.

## Local acceptance
Full254tests pass. Independent final /rev passed, including the corrected quaternion seam. Primary browser checked actual approach/impact/return at390×844; camera adjustment restored full foot visibility during return. Four real shots (including a miss) charged100energy; realDUNK showed the new skin, score02, progress1/3, exactly one bottom-row clear, energy0 and unlocked input. Preview disabled repeat click during playback and changed no counters.320×568 actual impact remained legible and full-page dimensions were320×568 with no overflow. Reset restored0score/0energy/30shots/idle3D. Browser warning/error log empty. Physical-phone FPS is not claimed; scene/pixel limits, adaptive pacing, baked clip and lightweight lighting are verified.
