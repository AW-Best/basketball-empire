# Street Session 3D

## /po vision
A mobile-first arcade bubble shooter with a recognizable sunset street court and a chunky original 3D basketball player. Keep tap/release shooting; make full energy reward a satisfying rim impact and rescue. No licensed player likenesses, new accounts, payments or external assets.

## /sm acceptance criteria
1. Genuine perspective 3D player/court/rim, readable at 390×844; hand-held ball until rim contact, then through-net drop and grounded landing. Preview never spends energy or changes challenge stats.
2. Target: 3 dunks in at most 30 shots. Danger contact loses. On shot exhaustion a charged final dunk remains playable. Win takes precedence after the final dunk lands; no automatic reset before result.
3. Win/loss show reason, dunks, cleared bubbles, best streak, shots and 1–3 performance stars on victory. Replay fully resets transient state; best record persists locally.
4. First visit opens a short illustrated guide; Help can reopen without losing progress. Guide blocks gameplay, no spending while open, dismissed guide persists best effort. Modal keyboard focus and Escape/Tab handling.
5. Lightweight local Three.js, no network models/CDNs. Max DPR 1.5 / 240k pixels, no real-time shadow maps/postprocessing; shared geometries/materials; idle 15fps, active up to60fps, adaptive30fps if sustained slow. Pause 3D and bubble loops when hidden. Context-loss fallback is functional 2D. Reduced motion supported.
6. Additional appeal: consecutive clearing shots build visible streak; objective/dunk progress always visible; victory stars encourage efficient replay; result can copy a challenge link/text on user click (no automatic posting).
7. Tests first for session outcomes/streak/stars, 3D rig key poses and mobile rendering budget; full regression suite, code review and live mobile-sized smoke before final publication claim.

## Proposed architecture (/arch and /ui approved)
- session.js pure challenge state / outcome / summary; no shot physics changes.
- street-motion.js pure 3D joint keyframes and budget helpers; tested independent of WebGL.
- court3d.js Three.js mesh rig, procedural street set, render scheduling and deterministic impact. Original low-poly art built from cached mesh primitives (no unlicensed model). HTML court mount adds WebGL canvas separately from existing 2D fallback.
- court-loader.js dynamically loads 3D and switches modes; keeps 2D constructor only on failed init/context lost. Single active animation source. Token/active guards prevent stale impact after reset; app fallback impact idempotent.
- app.js wires session, result and help; events continue isolating spectacle from scoring. All modules cache-versioned v9.
- Existing2D remains for fallback, otherwise it must not run. No changes to primary Hoopire multiplayer mode.

## UI audit (before / target)
Atmosphere3/4; palette4/4; animation3/4; particles4/4; transitions3/4; typography4/4; game feel3/4; gameover2/4; safe zone4/4; player prominence2/4; first impression3/4; thematic identity3/4; expressions N/A (stylized athlete, body-pose reactions).
Priorities: large readable3D athlete, offset hoop/camera not hidden behind scoreboard; cyan/amber court with purple skyline/fence/graffiti; short goal strip; bottom-sheet guide and full-game result; no idle strobing or heavy opening effects.

## Architecture/UI approval
Independent reviewer approved architecture and UI before implementation. Required boundaries: settle final shot before exhaustion; charged last-chance dunk; danger priority; reset frame times on visibility changes; idempotent impact through context loss; modal guide cancels gesture and pauses play.

## Developer browser checks and regression found
Local 390×844: guide closes, realWebGL court/rim visible, tap shooting and energy/clear work; completed actual 9-shot three-dunk run, got 3-star victory with31 cleared/4×streak; replayed and intentionally stacked to danger line, got failure after5shots and an accurate tip.
Regression case UI-R1 (before fix): replay must restore combo caption to LET’S BALL; observed stale “2 CLEARED BY DUNK!” after replay, while session counters correctly reset. Add caption reset and recheck on replay.
UI-R2: BEST SHOTS should expose the persistent efficiency target after victory, instead of a score that always ends at6.

## Review and QA evidence
- Independent /rev approved after fixes to 2D fallback hidden-time clock, real-vs-preview forwarding, and stale replay cleanup. /ui approved code layout; developer visually checked real mobile-sized browser views.
- 231 full regression tests passed, including11new tests covering session, motion/render budgets and fallback lifecycle.
- 390×844 actual play:9shots →3dunks →three-star win,31clear/4×streak. Replay →5stacked misses →danger failure. Native result modals and replay work.
- 320×568: guide scrolls within viewport with visible start action; footer bottom568, documentheight568, no page overflow. WebGL buffer318×109. Rim visible belowHUD, impact sampled during preview; preview spends no shots/energy.
- UI-R1 fixed and verified: fresh/replayedrun caption LET’S BALL. UI-R2 uses persistent BEST SHOTS (09after winning run).
- Physical low-end phone FPS is not measurable in the desktop browser. Hardware-friendly caps and adaptive pacing are implemented and budgets unit-tested.

## Production release
Code commit af23022, author Aaron Wang, pushed to AW-Best/basketball-empire main. Released with npm run deploy:cloudflare, Worker play version37876d07-b38c-42cd-85b2-efe33005100c. Live entry https://hoopire.com/bubble-court/?v=9. Verified initial guide,3D impact,390×844 fit (WebGL388×186),6-shot danger failure, copy confirmation and replay reset; no console errors. Node scene budget49mesh draw objects/4780triangles (browser adds3small text planes); architecture/window meshes instanced by material.
