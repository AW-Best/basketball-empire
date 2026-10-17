# Winner dunk / loser knockdown presentation

## /po vision and /sm acceptance criteria
User asks: the winning side performs a powerful dunk and the losing side gets knocked down. Apply to the current Bubble Court challenge and its real win/loss results; the prototype does not yet have network matchmaking.

1. Two readable teams: home teal07 and rival orange23, both using the existing free CC0 skinned model. Reuse the existing CMU-adapted dunk; add an original fixed-bone defensive contest, stagger, fall and recovery. No paid assets.
2. During charged/preview dunks home attacks and rival falls after rim impact. On challenge win the final home dunk leaves rival down; on loss the rival dunks over home before the loss summary opens. Preview buttons can demonstrate either side without changing score, energy, shots or result.
3. Fall starts at logical rim impact, never before. Fixed bind offsets/scales, no stretched limbs; landed body stays above floor. Normal dunks recover into idle; terminal outcomes hold their final tableau. Role changes/reset cannot leave root tilt on the next dunker.
4. Result summary opens after the losing-side vignette, once only. Replay/reset cancels stale completion/timeout, hidden time does not skip the vignette, and the result presentation never clears bubbles or awards a point. Existing single impact/clear and preview isolation remain intact.
5. Keep one model download / one motion download, bounded pixels/DPR, existing adaptive pacing and no shadow maps. Two-player scene target<35k triangles/<75mesh draw objects. All original GPU resources disposed once.
6. User explicitly requested this iteration prioritize the effect and skip automated tests. Inspect real phone-sized playback for both winner identities and outcome sequencing; no automated suite pass claimed.

## /arch and /ui proposed design
Parse the same downloaded GLB twice into independent skeleton/material ownership. createSkinnedPlayer gains palette/number options and a neutral-pose reset. loadSkinnedPlayer returns the home actor plus rival, with cascading idempotent disposal. No additional loader dependency or network asset.

The player actor exposes a defender pose controller for contest/knockdown/recovery timing. It rotates joints and a pelvis-centred root with fixed offsets and floor correction. buildStreetScene selects attacker/defender from winner identity, updates two contact shadows, and holds terminal outcome poses. The existing full-body dunk mixer stays unchanged.

StreetCourt and 2D fallback carry resultToken/winner/finale metadata through the completion event. A generation-token lifecycle in app.js handles loss vignette→summary, one-shot completion, visible-time fallback and reset cancellation. Winning final dunk is already the result animation, so it does not replay. Use two small preview buttons (your dunk/rival dunk). New presentation values stay in Constants.js; no changes to bubble collision, scoring or challenge balance.

## Audit
| Area | Before | Target |
|---|---|---|
| Team identity | 2/5 one athlete | 4/5 clear teal/orange opponents |
| Outcome spectacle | 2/5 text-only loss | 4/5 winner dunk + loser fall |
| Transition | 4/5 one athlete | 4/5 result waits for animation |
| Mobile clarity/performance | 4/5 | 4/5 both full bodies readable, bounded render cost |

## Review / validation
Architecture and UI approved by design_review: distinct teams, impact-driven knockdown, independent skeletons, cancellation-safe result callback, and phone-sized preview controls. Implementation in progress; release pending.

## Effect implementation
- Two independent CC0 skins, teal07/orange23; same downloaded bytes and CMU-derived dunk. Original defensive jump, palm-up contest, impact-driven backwards fall, floor correction and recover/hold. Winner raises arm after landing; subtle camera/net/floor pulse.
- Preview each winner without changing challenge counters. Final home dunk holds losing rival down; challenge loss plays the rival winner before opening summary. 2D fallback carries the same roles and token.
- /rev and /ui static review passed except background-time fallback; corrected fallback to accumulate capped visible ticks only. Role and resource cancellation reviewed.
- User requested no automated tests this iteration. JavaScript syntax checked; real phone-size browser preview inspected for both teams at390×844 and320×568 with no console warning/error. No device-performance benchmark or network multiplayer claimed.

## Release
Commit7bcdf67 pushed as Aaron Wang to AW-Best/basketball-empire. Cloudflare Workerplay version0079ef65-05bd-4cf9-85f7-f64cd84bbd85 serves https://hoopire.com/bubble-court/?v=12 . Live page showed both previews, both winner roles played with true3D and unchanged0score/0energy/30shots. First request experienced an asset fetch failure and used2D; reload loaded3D. Motion asset HEAD returned200. No automated test run this iteration.
