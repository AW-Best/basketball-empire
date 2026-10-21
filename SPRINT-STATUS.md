# Sprint Status — Auction, History, and Team Card Polish

## 砸筐闪电与同画面定格 — 2026-10-18，仅本地
- [x] /sm AC、/arch /ui预审与/rev最终复审通过。
- [x] 接触即闪电、100ms后飞球、末姿约2秒定格重叠；整段3秒，总流程6秒。
- [x] 去POWER/BREAK THEM大字提示层，保留小来源/数量及教学；真实镜头原点、末端carrier保留。
- [x] 8项新增RED→GREEN，102相关回归通过；四招实际flight/hold与恢复检查，详情docs/sprints/bubble-court-contact-hold.md。
- [x] 仅本地；没有提交、推送、部署。

## 四招统一3秒动作 — 2026-10-18，仅本地
- [x] /sm AC、/arch /ui预审；完整源片保留重点段相对慢放，统一映射3000ms。
- [x] 6项新增测试RED→GREEN；倒数3000 + 动作3000 + 爆发320 + 飞入600，总6920ms。
- [x] 卡片、指南、规则、独立对照页同步；原LAN/动作库时域兼容。
- [x] 94条相关回归通过，四招浏览器逐一实播、爆发/飞入与恢复正常；/rev最终复审通过。未提交、推送、部署。

## Dunk爆发与失败过渡 — 2026-10-18，仅本地
- [x] /sm AC、/arch /ui预审；规则文档合并为当前DEMO01基准。
- [x] 320ms闪电冲击 + 600ms实际干扰飞入；规则冻结覆盖尾段，0数量不补球。
- [x] 保留终局棋盘，逐渐去色后中文结果与再来一局；本地普通压力触底预览。
- [x] 新增测试RED→GREEN，详见docs/sprints/bubble-court-spectacle-ending.md。
- [x] 最终/rev + /ui通过；88相关 + 4HTTP测试通过；实际burst→flight、棋盘不变、失败与重赛已检查。未提交/推送/部署。

## 攻防反馈、干扰抵消与紧凑球场 — 2026-10-18，仅本地
- [x] game-designer审查、/sm /arch /ui /rev及用户追加方向要求完成，详见docs/sprints/bubble-court-combat-polish.md。
- [x] 平时58px状态条，攻击浮层与大字冲击；灰球橙边裂纹闪电及常驻邻近三连破解提示。
- [x] 3秒来源倒数、3.8秒砸筐落入、同次普通消除3:1 FIFO抵消、待落上限8、实际发送0～4；灰球/Dunk不刷能量或抵消，只触底结算。
- [x] 中文青绿“你→对手”/橙红“对手→你”及相反粒子流向，idle双方DUNK次数、收到对手干扰提示；空闲SVG不重绘。
- [x] TDD新增15项；全套357项356过（方向追加前），唯一既有旧athlete失败；方向追加相关9项绿。手机390×844实测Dunk前后board rect完全一致(0,187,390,534)。
- [x] 规则文档已同步，8780本地运行，未提交/推送/部署。

## 单人模拟对战 DEMO01 — 2026-10-18，仅本地
- [x] 用户确认对模拟对手；/sm、/arch、/ui及最终/rev审查通过，详见docs/sprints/bubble-court-solo-demo.md。
- [x] 固定DEMO01入口（按钮/链接/房间码），每页独立；模拟对手自动准备、真实发射蓄能反击，不需要第二部手机。
- [x] TDD新增5项红→绿；相关规则/客户端33、HTTP联网4项通过，实际BOT自然DUNK、真人扣完继续发射及单人触底后重赛通过。
- [x] 手机390×844操作区完整，模拟标签/指南明确且隐藏真人邀请。8780服务可试玩；未提交、推送、部署。

## Dunk可重复局内攻击 — 2026-10-18，仅本地
- [x] /sm AC、/arch与/rev审查；诊断与修复见docs/sprints/bubble-court-repeat-dunk.md。
- [x] 无合法落点拒发且不耗球；仅实际危险线接触结算，记录触线原因，保留同刻平局。
- [x] 普通消除自然蓄能两次DUNK回归；动画中继续射击；纯规则26/26通过，HTTP自然循环通过。
- [x] 浏览器双页同局DUNK两次、对方8灰球、双方继续射击，phase=playing、round=1。
- [x] 全套339项338通过、1项既有旧3D athlete失败；补充危险线边界测试通过。本地8780服务运行，未提交/推送/部署。

## LAN 双手机对战与双手扣篮 — 2026-10-18，仅本地

- [x] /sm /arch /ui审查通过；AC与结果在docs/sprints/bubble-court-network-duel.md。
- [x] 真实Dunkademics视频0.25倍速对照，增加躯干蓄力与前送；共享2.5D场景，头前手后透视，预览STUDY16。
- [x] 原生HTTP房间服务、自动座位与房间码、服务器时钟、验证动作/幂等/隐私；手机LAN HTTP无需WebLocks。
- [x] 两客户端互发DUNK与4灰球、刷新恢复/胜负；390×844实际布局与LAN邀请验证。
- [x] 新增24测试与原规则21测试通过；全334项333通过，唯一既有3D掌心碰筐测试失败。
- [x] 8780本地LAN服务已启动；未提交、未push、未部署。实体两手机同Wi-Fi体验待用户试玩。

## Hand transfer05 — local only, 2026-10-17

- [x] /sm /arch /ui approval, AC and verification in docs/sprints/bubble-court-hand-transfer.md.
- [x] TDD bounded wrist flex, near-surface ball grip, gradual800–860ms rim closure and later thumb transfer; short round pads replace full-length hooks.
- [x] Preserve storyboard04 timing, ball/net pocket and game rules; improve six-keyframe preview with two-row touch controls.
- [x] /rev passes;46targeted tests green; full300tests299pass with only pre-existing3D palm test failure.
- [x] Actual585/830/975ms,normal/half speed and320/390 phone inspection. No commit,push or deployment.

## DUNK storyboard04 — local only,2026-10-17

- [x] /sm /arch /ui approve the user's1.5s storyboard; AC in docs/sprints/bubble-court-storyboard.md.
- [x] TDD:600–800ms accelerating wrist slam,late carrying-to-rim transition,1150ms release and local net pocket;43related tests pass.
- [x] Renderer draws bag-shaped net around the descending ball;attack badge avoids the net and travels during the finish.
- [x] /rev passes;normal/slow,keyframes,phone sizing and reduced-motion preview checked.
- [x] Full suite297:296pass,only known old3D athlete palm failure. No commit,push or deployment.

## Comic hand study03 — local only, 2026-10-17

- [x] /sm /arch /ui approval and AC in docs/sprints/bubble-court-comic-hand.md.
- [x] TDD articulated palm/thumb/three finger groups, shared wrist rotation, fixed rim contacts and gradual release before withdrawal.
- [x] Warm skin silhouette, tapered dark sleeve and team cuff; shared in-game/preview renderer; new wrist/release keyframes.
- [x] /rev passes;40targeted tests pass,hand sampler100%line coverage. Full294tests293pass with only pre-existing3D palm failure.
- [x] Actual phone framing,normal/half speed,reduced-motion and A DUNK/B +4gray verified. No commit,push or deployment.

## Comic DUNK polish — local only, 2026-10-17

- [x] /sm AC and /arch /ui approval in docs/sprints/bubble-court-comic-dunk-polish.md.
- [x] TDD pure motion sampler: gather/lift/slam,800ms contact,60ms visual hold,hand gripping rim,independent ball descent,damped net;10new tests green.
- [x] Original vector comic, uniform scaling, layered net/ball/fingers, bounded camera impact and +4 indicator; rules untouched.
- [x] Shared-renderer local preview with replay,half speed,keyframes,scrub,roles and reduced-motion control.
- [x] /rev passes;31targeted tests pass;full285tests284pass with only known old3D palm failure.
- [x] Actual phone framing/keyframe checks and real A DUNK/B simultaneous shot/+4garbage verified. No commit,push or deployment.

## Local Bubble Court duel — 2026-10-17, uncommitted

- [x] Save agreed Chinese rules in docs/bubble-court-duel-rules.md and AC in docs/sprints/bubble-court-local-duel.md.
- [x] /sm, /arch, /ui approve isolated local two-tab mode and Web Locks transactions.
- [x] TDD: 21 room/rule/transport tests green; model + room line coverage100%, branch>90%.
- [x] Implement simultaneous boards, shared countdown, pop energy, manual comic DUNK, own bottom-row rescue, opponent +4 gray bubbles, pressure, danger result and rematch.
- [x] Fix review findings: freeze at presence expiry across simultaneous sleep; reject old snapshots; keep footer visible on320×568; spread attack across the current frontier; allow reclaiming an expired seat.
- [x] /rev passes. Actual local A/B attacks, touch-style pop (+48 energy),390×844/320×568 framing, refresh, A win/B loss and both-ready rematch verified; no console warnings/errors.
- [x] Existing 3D athlete palm test still fails; unchanged original3D files, independent local duel passes. No commit, push or deployment per user instruction.

## Sprint 048 — Straight-On End-Court Camera

- [x] Record acceptance criteria, architecture, and original UI direction.
- [x] RED: specify the straight-on court horizon, crowd bowl, and larger centered hoop.
- [x] GREEN: replace the elevated court with an original end-court composition.
- [x] Verify the actual responsive Canvas output against the supplied reference composition.
- [x] Run the full suite (166 passing), commit, deploy, and verify production.

## Sprint 047 — Top Hoop and Upward Shooting

- [x] Record acceptance criteria, architecture, and UI direction.
- [x] RED: specify centered top hoop, bottom shooting positions, and unrestricted horizontal launch.
- [x] GREEN: align hoop, court, shot target, and ball positions to bottom-to-top play.
- [x] Verify an actual upward drag-and-release shot in the responsive browser view.
- [x] Run the full suite (165 passing), commit, deploy, and verify production.

## Sprint 046 — Front-Facing Hoop and Round Ball

- [x] Record acceptance criteria, architecture, and original UI direction.
- [x] RED: specify front-facing hoop geometry and uniform Canvas scaling.
- [x] GREEN: render the front-facing hoop and preserve the round ball.
- [x] Verify the actual responsive Canvas output in the browser.
- [x] Run the full suite (164 passing), commit, deploy, and verify production.

## Sprint 045 — Simple Shooting Reference Pass

- [x] Record scope, acceptance criteria, architecture, and original visual direction.
- [x] RED: specify a simple swipe-to-shoot game with focused arena presentation.
- [x] GREEN: add the perspective court, arena lights, rim target, and clearer instructions.
- [x] Run the complete suite (163 passing) and verify the Canvas composition with the existing responsive layout.
- [x] Commit, deploy, and verify the refinement on `hoopire.com`.

## Sprint 044 — Buzzer Beater MVP

- [x] Record acceptance criteria, architecture, and UI direction.
- [x] RED: specify game rules, physics helpers, mode navigation, and responsive interface.
- [x] GREEN: ship the playable 60-second single-player challenge.
- [x] Run the complete automated test suite (162 passing).
- [x] Verify desktop and mobile gameplay, including drag-and-release, shot counting, timer expiry, and final results.
- [x] Commit the MVP implementation in a reviewable first batch.
- [x] Deploy the MVP to Cloudflare and verify the public page, script, and health endpoint on `hoopire.com`.

## Sprint 043 — IP Risk Reduction

- [x] Record acceptance criteria, architecture, and UI approach.
- [x] RED: protect the active product from the retired mode name, real-player names, and conflicting team branding.
- [x] GREEN: ship Dynasty Circuit with fictional prospects and the Capital Crowns.
- [x] Run the complete automated test suite (154 passing).
- [x] Deploy and verify the public site at `hoopire.com`.

## Sprint 042 — Initials-Only Avatars

- [x] Record acceptance criteria and compatibility approach.
- [x] RED: require room forms without photo or camera controls.
- [x] GREEN: remove avatar inputs, compression, styles, and payload data.
- [x] Preserve legacy avatar rendering and initials generation.
- [x] Run all 152 automated tests successfully.
- [x] Deploy and verify the simplified room forms.

## Sprint 041 — Visitor Analytics

- [x] Record acceptance criteria, architecture, privacy, and UI design.
- [x] RED: specify global daily-deduplicated visits, homepage display, and deployment bindings.
- [x] GREEN: implement the Durable Object counter and arena attendance scoreboard.
- [x] Document the first-party counter cookie and Cloudflare Web Analytics.
- [x] Run all 152 automated tests successfully.
- [x] Deploy and verify the production counter and private Cloudflare analytics.

- [x] Requirements and acceptance criteria recorded
- [x] Architecture and UI approach approved from the existing game design
- [x] RED: add failing auction, history, affordability, dice, and card tests
- [x] GREEN: allow every active player to bid
- [x] Record point awards and recruited-player activity
- [x] Expand team cards and grey unaffordable purchases
- [x] Restore normal dice and Richup-style history emphasis
- [x] Verify the full automated test suite
- [x] Publish and restart the room server

## Sprint 007 — Render Deployment

- [x] Add a tested Render Blueprint for the Node.js service.
- [x] Document free-tier room persistence limitations.
- [ ] Create the private GitHub repository and connect it to Render.
- [ ] Verify the deployed HTTPS page and health endpoint.

## Sprint 008 — Dice, Auction, and Recruiting Fixes

- [x] RED: specify a standard animated dice roll, five-second auctions, and responsive Recruit flow.
- [x] GREEN: replay a normal dice tumble on every roll without basketball-shot effects.
- [x] Change auction start and bid-reset windows to five seconds.
- [x] Open the Scouting Board from a team card and preselect that team.
- [x] Verify the full automated test suite and commit the completed fix.

## Sprint 009 — Leave Game

- [x] RED: specify an in-game leave/new-game control and session cleanup.
- [x] GREEN: clear the saved identity, disconnect live updates, and return to Create/Join.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 010 — Lobby Rulebook

- [x] RED: specify a player-facing rulebook on the Create/Join screen.
- [x] GREEN: add a responsive in-page rulebook with the implemented game rules.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 011 — Host Game Length

- [x] RED: specify host-selected 10, 15, 20 minute, and Unlimited matches.
- [x] GREEN: enforce the selected duration through the UI, API, room service, and game engine.
- [x] Show an infinity clock for Unlimited matches and prevent automatic expiry.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 012 — Trading, Bankruptcy, and Balance Feedback

- [x] RED: specify authoritative trade offers, voluntary bankruptcy, and the new UI contracts.
- [x] GREEN: implement PTS/asset trading and recipient accept/reject controls.
- [x] Add synchronized balance-change badges, My Teams naming, and a real basketball brand mark.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 013 — Doubles Extra Roll

- [x] RED: specify that doubles grant the same player another roll after resolving the space.
- [x] GREEN: preserve and consume the server-authoritative extra-roll state.
- [x] Show `ROLL AGAIN` and record the bonus in game history.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 014 — 3D Dice and Visible Bankruptcy Control

- [x] RED: specify pip-only 3D dice and an always-visible bankruptcy control.
- [x] GREEN: implement tactile white dice and disabled-state bankruptcy guidance.
- [x] Verify the full automated test suite and commit the completed feature.

## Sprint 015 — Full Auction Overlay

- [x] RED: specify the synchronized auction overlay and asset details.
- [x] GREEN: implement current bid, countdown progress, bid totals, history, and asset card.
- [x] Verify responsive behavior, run the full suite, and commit.

## Sprint 016 — Dismiss Event Cards

- [x] RED: specify a local close control for Team Ops and Game Time cards.
- [x] GREEN: add the accessible × button and cancel the reveal timer when used.
- [x] Run the full suite and commit.

## Sprint 017 — Basketball Empire Game-Mode Hub

- [x] Record acceptance criteria and the single-page screen-state design.
- [x] RED: specify the mode hub, Basketnopoly entry, and invite/session bypass.
- [x] GREEN: add the responsive mode selector and lobby navigation.
- [x] Run the full suite, publish, and verify the live page.

## Sprint 018 — Weighted 3D Dice Motion

- [x] Record the observed movement pattern and acceptance criteria.
- [x] RED: specify face cycling, separate trajectories, bounce, and settle timing.
- [x] GREEN: implement the improved dice throw.
- [x] Run the full suite, publish, and verify the live game.

## Sprint 019 — Auction Layer Regression Fix

- [x] Diagnose the nested stacking-context collision from the supplied screenshot.
- [x] RED: require the auction to live at the page modal root.
- [x] GREEN: move and isolate the auction overlay above all game content.
- [x] Run the full suite, publish, and verify the live auction.

## Sprint 020 — Cloudflare Workers Runtime

- [x] Tag the current Node.js baseline as `v0.1.0-node`.
- [x] Record the Workers, Assets, and Durable Objects architecture.
- [x] RED: specify Cloudflare routing, persistent rooms, API compatibility, and polling fallback.
- [x] GREEN: implement the Worker and SQLite-backed `BasketballRoom` Durable Object.
- [x] Add Wrangler local-development and deployment commands.
- [x] Verify static assets plus create/join room behavior in `wrangler dev`.
- [x] Deploy to the user's Cloudflare account and verify the public URL.

## Sprint 021 — Short Cloudflare Worker URL

- [x] Record requirements, acceptance criteria, and the service-rename approach.
- [x] RED: require the Wrangler Worker name to be `play`.
- [x] Rename the existing Worker service without replacing its Durable Object storage.
- [x] GREEN: update Wrangler and pass the deployment plus full test suites.
- [x] Publish through GitHub and verify the shortened public URL.

## Sprint 022 — 60-Second Quick Start Guide

- [x] Record acceptance criteria, architecture, and the arena-tunnel visual direction.
- [x] RED: specify the five-step guide, navigation, persistence, and mobile behavior.
- [x] GREEN: implement the lobby and live-game How to Play experience.
- [x] Verify the full suite, publish, and check the Cloudflare deployment.

## Sprint 023 — Dice Motion, Trade Alerts, and Short Games

- [x] Record acceptance criteria, architecture, and court-impact motion direction.
- [x] RED: specify dice phases, recipient alerts, and 3/5-minute validation.
- [x] GREEN: implement all three features across UI, Node, and Cloudflare.
- [x] Verify, publish, and check production.

## Sprint 024 — True 3D Dice

- [x] Define six-face cube structure and physical motion acceptance criteria.
- [x] RED: prove the flat dice fail the six-face 3D contract.
- [x] GREEN: implement perspective cubes, independent rotation, lighting, and impact depth.
- [x] Verify, publish, and check production.

## Sprint 025 — 3D Dice Flattening Fix

- [x] Reproduce the paper-thin mid-roll frame in the live browser.
- [x] RED: protect against competing wrapper rotations and 3D-flattening filters.
- [x] GREEN: isolate trajectory motion from cube rotation and preserve the 3D subtree.
- [x] Publish and verify both hosted versions.

## Sprint 026 — WebGL Rounded Dice

- [x] Define architecture and acceptance criteria.
- [x] RED: add WebGL integration and settlement contract tests.
- [x] GREEN: implement rounded dice geometry, pips, lighting, and animation.
- [x] Verify the full suite, publish, and visually check both hosted versions.

## Sprint 027 — Dice Physics Polish

- [x] Define architecture and acceptance criteria.
- [x] RED: specify compact rigid motion, staggered settling, and inset pips.
- [x] GREEN: implement the revised geometry and motion.
- [x] Verify, publish, and visually check the hosted versions.

## Sprint 028 — Mobile Dice Sizing

- [x] Define architecture and acceptance criteria.
- [x] RED: specify phone/tablet WebGL scaling and a smaller phone tray.
- [x] GREEN: implement responsive sizing.
- [x] Verify, publish, and visually check production.

## Sprint 029 — Rigid-Body Dice Motion

- [x] Define architecture and acceptance criteria.
- [x] RED: specify gravity, floor contact, friction, collision, and authoritative settling.
- [x] GREEN: implement lightweight rigid-body dice physics.
- [x] Verify, publish, and visually check production.

## Sprint 030 — Dice Shadow and Roll Variation

- [x] Define architecture and acceptance criteria.
- [x] RED: specify dynamic contact shadows and deterministic variation.
- [x] GREEN: implement shadows and seeded motion.
- [x] Publish and visually check production.

## Sprint 031 — Dice Edge Contact and Natural Settling

- [x] Define architecture and acceptance criteria.
- [x] RED: specify oriented cube contact and late result settling.
- [x] GREEN: implement quaternion-aware support and progressive correction.
- [x] Verify, publish, and visually check production.

## Sprint 032 — Smaller Responsive Dice

- [x] Define architecture and acceptance criteria.
- [x] RED: specify a further 15% responsive size reduction.
- [x] GREEN: update the shared dice scale.
- [x] Verify, publish, and visually check production.

## Sprint 033 — Compact Responsive Dice

- [x] Define architecture and acceptance criteria.
- [x] RED: specify compact responsive scales.
- [x] GREEN: implement the compact scales.
- [x] Verify, publish, and visually check production.

## Sprint 034 — Thirty Percent Dice Reduction

- [x] Define architecture and acceptance criteria.
- [x] RED: specify the exact 30% scale reduction.
- [x] GREEN: implement the new responsive scales.
- [x] Verify, publish, and visually check production.

## Sprint 035 — Stable Dice Faces

- [x] Define architecture and acceptance criteria.
- [x] RED: specify result synchronization, smooth correction, and compact pips.
- [x] GREEN: implement stable face presentation.
- [x] Verify locally and visually check the synchronized result.
- [x] Publish and verify production.

## Sprint 036 — Richup-Style Roll and Token Movement

- [x] Record the observed dice-to-token movement sequence and acceptance criteria.
- [x] RED: specify the shared motion profile, hop/trail states, and corner pacing.

- [x] GREEN: implement block-by-block movement polish.
- [x] Verify the full automated test suite and commit.

## Sprint 037 — Calmer Dice Spin and Wider Spacing

- [x] Record motion requirements and UI direction.
- [x] RED: specify reduced spin and wider separation.
- [x] GREEN: implement WebGL dice motion tuning.
- [x] Verify the full automated test suite and commit.

## Sprint 038 — Copyright and Fan-Project Notice

- [x] Record acceptance criteria and the semantic-footer approach.
- [x] RED: specify the copyright, independence, and fictional-content notice.
- [x] GREEN: add the global responsive legal footer.
- [x] Verify the complete 143-test suite.
- [x] Commit and publish the notice.

## Sprint 039 — Google AdSense Foundation

- [x] Record acceptance criteria, deployment architecture, and consent responsibility.
- [x] RED: specify the publisher script, ads.txt, privacy notice, and footer link.
- [x] GREEN: add the AdSense and privacy assets without changing gameplay.
- [x] Verify all 145 tests, commit, deploy, and check the public endpoints.

## Sprint 040 — AdSense Verification Hardening

- [x] Confirm production serves the correct script and ads.txt to all Google crawler identities.
- [x] RED: specify alternate meta verification and explicit crawler access.
- [x] GREEN: add the verification metadata and robots.txt.
- [x] Verify all 147 tests, commit, deploy, and recheck production using Google crawler identities.

## Sprint 041 — Hoopire Custom Domain

- [x] Record acceptance criteria and the Cloudflare Custom Domain architecture.
- [x] RED: require `hoopire.com` in the Wrangler deployment contract.
- [x] GREEN: bind the apex domain to the Worker while retaining workers.dev.
- [x] Verify all 148 tests, commit, deploy, and check HTTPS, multiplayer, and AdSense endpoints.

## Sprint 049 — Floating Rim Levels

- [x] Define architecture, UI direction, acceptance criteria, and test cases.
- [x] RED: specify four-make progression, Level 2, and a backboard-free rim.
- [x] GREEN: implement level state, HUD progress, and moving-rim gameplay.
- [x] Verify the full 169-test automated suite.
- [ ] Complete browser play-check, commit, and deploy the level challenge.

## Sprint 050 — Buzzer Leaderboard and Level Roadmap

- [x] Research comparable basketball progression patterns.
- [x] Define architecture, UI, privacy, acceptance criteria, and six-level roadmap.
- [x] RED: specify Top 5 persistence, validation, deployment binding, local API, and score dialog.
- [x] GREEN: implement the global leaderboard and nickname/Anonymous flow.
- [x] Verify the full 175-test suite and responsive browser presentation.
- [x] Commit, deploy, and verify the production leaderboard endpoint.

## Sprint 051 — Buzzer Onboarding and Power Feedback

- [x] Define architecture, UI direction, acceptance criteria, and accessibility behavior.
- [x] RED: specify the animated three-step tutorial and semantic live power meter.
- [x] GREEN: implement tutorial motion, percentage feedback, charging emphasis, and mobile visibility.
- [x] Verify the full suite and browser presentation.
- [x] Commit and deploy.

## Sprint 052 — Buzzer Tutorial Video

- [x] Define architecture, UI direction, acceptance criteria, and accessibility behavior.
- [x] RED: specify a replayable tutorial, visible basket, and in-game tutorial entry point.
- [x] GREEN: implement the timed lesson, front-facing hoop and net, captions, and replay controls.
- [x] Verify the full suite and browser presentation.
- [x] Commit and deploy.

## Sprint 053 — School Story Page

- [x] Record the English, Year 8, text-only presentation requirements.
- [x] RED: specify story content, keyboard navigation, and print support.
- [x] GREEN: build the presentation page and natural speaking script.
- [x] Run the full suite and verify the page locally.

## Sprint 054 — One-Tap Side-Hoop Level 1

- [x] Record the supplied-video gameplay requirements and approvals.
- [x] RED: specify fixed tap shots, 1/2/3 scoring, and basket-side switching.
- [x] GREEN: implement the portrait side court, one-tap controls, and Level 1 loop.
- [x] Verify a complete four-basket browser play-through.
- [x] Run the full suite, commit, deploy, and verify production.

## Sprint 055 — Repeated-Tap Ball Flight

- [x] Re-check the supplied video and correct the interaction model.
- [x] RED: specify repeated upward impulses and in-flight input.
- [x] GREEN: implement gravity-driven tap-to-fly controls and update the tutorial.
- [x] Browser-play a scoring rhythm into both basket sides.
- [x] Run the full suite, commit, deploy, and verify production.

## Sprint 056 — Video-Style Mid-Play Interaction

- [x] Inspect the supplied video's middle sequence frame by frame.
- [x] RED: specify same-ball side switching and tactile feedback.
- [x] GREEN: implement continuous ball play, smoke, tap pulse, net kick, flash, and score burst.
- [x] Browser-play consecutive makes across both basket sides.
- [x] Run the full suite, commit, deploy, and verify production.

## Sprint 057 — Explicit Tap Tutorial

- [x] Define the press, rise, release, fall, and repeat teaching sequence.
- [x] RED: specify a visible TAP control, press ripple, and phase captions.
- [x] GREEN: synchronize three button presses with the basketball's stepped flight.
- [x] Run the full suite, commit, deploy, and verify production.

## Sprint 058 — Tutorial Ball Effects

- [x] Define the live-game effects that belong in the tutorial.
- [x] RED: specify pulse, smoke trail, and height-reactive shadow layers.
- [x] GREEN: synchronize the ball effects with the tutorial flight timeline.
- [x] Run the full suite, commit, deploy, and verify production.

## Sprint 059 — Moving-Rim Level 2

- [x] Define the second-level rules, transition, and moving-hoop behavior.
- [x] RED: specify level advancement and bounded hoop movement.
- [x] GREEN: continue after Level 1 with a fresh clock and moving rim.
- [x] Run the full suite, commit, deploy, and verify production.

## Sprint 060 — ads.txt Reliability

- [x] Diagnose the repeated AdSense `Not found` report against production.
- [x] RED: prove `/ads.txt` still depends on the static asset binding.
- [x] GREEN: serve the publisher record directly from the Worker.
- [x] Route `/ads.txt` through the Worker and pass all 189 tests.
- [x] Commit, deploy, and verify production.

## Sprint 061 — ads.txt request diagnostics

- [x] Acceptance criteria, independent architecture and privacy/quality review.
- [x] RED/GREEN: bounded GET/HEAD diagnostics and explicit log persistence.
- [x] Full suite: 193 passing; Wrangler deployment dry run passes.
- [x] Deployed version 71f05fac-9c65-4ce0-bb80-b60de8d1b831; GET/HEAD 200 verified and HEAD diagnostic confirmed in persisted Workers Logs.


## Bubble Court — mobile practice mode

- Added independent static mode with coarse aim, relative fine adjustment, explicit fire and launch-zone game over.
- Integration red/green and all 214 regression tests pass.
- Git commit identity: Aaron Wang <aaronwang2030@gmail.com>.
- Pushed to AW-Best/basketball-empire main (a7bf690), author Aaron Wang.
- Cloudflare production deployed, version 3f5a6298-ae7a-43e7-9f04-d905dd411258.
- Verified live HTML contains fine-aim, shoot, game-over and play-again; live script includes launch-zone failure. Entry: https://hoopire.com/bubble-court/index.html

## Bubble Court — quick mobile input
- Default: tap to fire, hold/drag to preview and release to fire. Releasing outside the target area or pointer cancellation never fires.
- Fine ruler and explicit Shoot moved into collapsed optional precision mode.
- Removed fixed minimum screen heights, fitted bubble size to playfield height, retained red-line loss/replay and dunk behavior.
- Architecture: gesture state in AimControl; existing physics/scoring unchanged. New tests observed red then green; 216 regression tests pass. Browser preview navigation unavailable; real-device smoke verification pending.
- Live smoke review exposed inadequate board headroom on short/wide viewports. Added tested responsive radius with at least three extra rows before danger line; cache-versioned changed input/layout modules. All 217 tests pass. Quick mode release first deployed as 6441a89b-653c-4c61-9770-361bdee743e7; layout follow-up pending.

## Bubble Court — clear feedback and dunk rescue
- [x] Acceptance criteria and architecture/UI review recorded in docs/sprints/bubble-court-feedback.md.
- [x] Red/green tests for lowest row clearing, activation guards and non-energy clear labels.
- [x] Staggered colored bursts/falling balls, bounded energy motes and golden row sweep.
- [x] Rim-contact clear, input lock, reset cancellation, preview isolation and one-shot fallback for background tabs.
- [x] 220 tests pass. Production version 27107c77-2ed3-4964-b9f2-e9de03883334 deployed to hoopire.com; commit b329c08 pushed as Aaron.
- [x] Live 390×844 browser smoke: shots charged 48 → 96 → 100, dunk spent bar to 0, score became 02, deepest single occupied row cleared, controls unlocked afterward; no browser errors.

## Sunset Court 3D challenge
- [x] /po vision, /sm AC, independent /arch and /ui design approval in docs/sprints/bubble-court-3d.md.
- [x] Test-first session outcomes, streak/stars, 3D keyframes, pixel budget, geometry budget and pause/impact clock.
- [x] Local low-poly 3D court/athlete, 2D fallback, bounded resolution and frame pacing.
- [x] 3-dunk/30-shot challenge, win/loss summary, guide and copyable challenge result.
- [x] Independent /rev approved after fallback lifecycle fixes; /ui layout approved.
- [x] Local390×844 actual9-shot/3-dunk three-star win, replay,5-shot danger failure;320×568guide/viewport fit, actualWebGL impact and no browser errors.
- [x] Full231tests green; low-poly geometry and static architecture instancing cut draw calls.
- [x] af23022 pushed as Aaron to AW-Best; Cloudflare production version37876d07-b38c-42cd-85b2-efe33005100c deployed.
- [x] Livehoopire.com/bubble-court/?v=9: first guide, WebGL impact,390×844 fit (footer839/document844,buffer388×186), danger failure, successful challenge-copy and replay reset verified; no console errors.

## Skinned athlete revision
- [x] /arch and /ui approve local CC0 skinned athlete, fixed bone offsets and contact-correct original clip.
- [x] New red/green tests on real asset: constant bone lengths/offsets, planted feet, palm/rim continuity, mobile geometry and approach momentum.
- [x] Continuous skinned body, street uniform, hair/sneakers and baked quaternion AnimationClip.
- [x] Primary browser playback QA at390×844/320×568; actual100-energy dunk cleared one row once, score02/progress1of3/energy0/unlocked.
- [x] Independent /rev passed; timeout and skeleton disposal suggestions fixed and re-reviewed.239regression tests pass.
- [x] Publish v10 and verify actual new skinned preview rim contact on hoopire.com. Official Three.js blending/IK examples reviewed. Added cold-load preloads and fallback diagnostics;241tests green.

## Complete dunk motion asset revision
- [x] /po vision and /sm AC recorded in docs/sprints/bubble-court-motion-asset.md.
- [x] /arch + /ui approve offline retarget/transition/light design and free CMU layup adaptation.
- [x] Acquire free CMU124_06 full-body layup; retarget and adapt rim contact into dunk, provenance/conditions/hash recorded.
- [x] Test-first Acclaim parser, actual imported clip, return/ball/camera continuity, cold-load parallelism and dusk lighting.
- [x] Actual390×844 and320×568 playback, four real shots charging100 then one dunk/one bottom-row clear, reset/no overflow;254tests pass and independent /rev approved.
- [x] b7498cd pushed as Aaron to AW-Best; Cloudflare076815b1-5ca3-4742-924f-a49d2a162760 deployed. Live?v=11 HTML,3D renderer, imported motion impact playback and no console warnings/errors verified.

## Poster dunk outcome revision
- [x] /po vision and /sm AC in docs/sprints/bubble-court-poster-duel.md.
- [x] /arch + /ui approve dual-rig presentation and result lifecycle.
- [x] Implement dual crew, contest/knockdown/recovery, deferred result summary and original celebration; user explicitly waived automated tests to prioritize the effect.
- [x] Actual home/away preview at390×844 and320×568; no console errors. Static /rev found background fallback timing; fixed to count visible time only. Automated tests deliberately not run.
- [x] 7bcdf67 pushed as Aaron to AW-Best; Cloudflare0079ef65-05bd-4cf9-85f7-f64cd84bbd85 published. Live?v=12 loaded dual 3D actors; both preview roles played. First asset fetch failed transiently; reload loaded 3D, motion URL returned200. Automated tests deferred per user.

## Standalone poster dunk motion lab
- [x] Vision/AC and scope recorded in docs/sprints/bubble-court-dunk-lab.md.
- [x] /arch and /ui approval.
- [x] Full-body paired animation with stagger steps and planted supporting palms; existing free CMU source and CC0 skins only.
- [x] Slow motion, scrub, roles/cameras and desktop/390×844/320×568 visual inspection.
- [x] Static /rev approved after bfcache lifecycle fix. Automated suite deferred under user visual-first instruction.
- [ ] Publish standalone demo and inspect live.

## Comic victory moment — local only
- [x] User scope/AC documented in docs/sprints/bubble-court-comic-win.md.
- [x] Architecture/UI approved; original2D SVG art +1.5s motion implemented.
- [x] Actual local normal/slow playback, rim impact/final poster, CSS320×568/390×844 framing; no console errors. /rev approved. Syntax checked; automated suite deferred per user.
- [x] Local preview ready at http://localhost:8772/bubble-court/win-lab/ . No push or publication performed.

## Standalone full-player comic dunk — local only
- [x] User scope: replace hand with full player only in independent preview; do not integrate into duel.
- [x] /sm AC, /arch + /ui approval in docs/sprints/bubble-court-player-preview.md.
- [x] Test-first fixed-length full-body motion, ball/rim contact, grounded landing and reduced-motion poses; original2D jersey/shorts/shoes/face art.
- [x]10 new tests and56 related tests pass; /rev approved after net/rim layer repair. Full npm suite not run because escalation declined.
- [x] Actual local playback/half-speed and scrubbing inspected; screenshot /tmp/hoopire-duel-preview/player-study-v6.jpg.
- [x] Local independent preview ready; no commit, push or deploy.

- 2026-10-18追加：DEMO01轻松节奏（5秒射击/扣篮后8秒恢复/35秒压力），3秒倒数后再显示扣篮；暂停恢复和全抵消演出TDD修复，独立追加审查通过。最后全套362项361过，之后新增3项相关回归通过；不提交/部署。

### DEMO01 四招选招（本地，不提交不部署）
- [x] /sm AC、/arch 与 /ui 设计预审，/rev 复查
- [x] 四卡选择/取消与重复操作保护
- [x] 四招相同100能量、底排清除、最多4干扰与防守规则
- [x] 原动作Canvas接入；3秒预告、各自命中时刻、来源与独立待落显示
- [x] 轻松BOT轮换、可收起演出、30fps/DPR1.5、降动态与加载回退
- [x] 新测试RED→GREEN与相关规则/网络回归
- [x] 最终浏览器四招与手机尺寸检查（390×844、390×650；取消、重复蓄能、演出发射、双向同时来袭、收起）

### 固定棋盘与叠加扣篮（本地）
- [x] /sm、/arch、/ui AC预审
- [x] 实际浏览器先红：倒数导致棋盘下移27px
- [x] 固定58px场景槽和32px状态行，动画绝对定位、输入穿透
- [x] 保留手势、收起与既有攻击规则；相关23项测试通过
- [x] 两种手机尺寸实际浏览器几何复测与/rev：390×844、390×650均一致；演出覆盖处点击仍发射

### 攻击身份双视角设计（独立稿）
- [x] /sm、/arch、/ui预审与/rev通过
- [x] 同一攻击的发送/接收身份、上行/下行、目标/来源和能量差异
- [x] 三阶段关键帧、部分/全部抵消示意，0落球与BLOCK状态
- [x] 4项展示测试与桌面/390px浏览器检查
- [x] 仅本地设计页，不接入真实对战，不提交、不部署

### 居中受击 + 关键段慢放（本地DEMO01）
- [x] /sm、/arch、/ui预审与/rev；飞球覆盖灰球问题RED复现后修复
- [x] 虚拟比赛钟暂停双方规则，独立演出时钟，结束幂等落灰
- [x] 4招局部慢放，基础2.1s；原LAN兼容
- [x] 试玩接招入口、独立对照页居中演出与真实慢放播放按钮
- [x] 84相关测试 + 4HTTP回归通过
- [x] 最终实战画面与恢复验证：居中+暗背板、禁用输入、棋盘rect不变；结束后shots从0到1

## 2026-10-18 — 完整大招与顶部反馈（本地）

- 已完成：后三招释放、飞行、命中后才定格；接收特效横铺游戏容器，得分提示移到棋盘外固定HUD。
- 108项相关测试通过；浏览器实际三招、受击全宽、真实消除反馈检查完成，棋盘位置尺寸稳定。
- 详见 docs/sprints/bubble-court-skill-release.md；不提交、不部署。

## 2026-10-18 — 后三招动作特写（本地）

- 已去掉风车/黑洞/巨猫演出内的两块假棋盘与能量条，改为完整动作与球的跟随特写；命中后保留人物/猫爪收势。
- 新增5条RED→GREEN，113条相关测试通过；浏览器三招、末姿、横铺接收与继续游戏实际检查完成。
- 详见 docs/sprints/bubble-court-action-closeup.md；不提交、不部署。

## 2026-10-18 — 巨猫放慢（本地）

- 巨猫演出改4秒，1.5秒拍击、2.8秒命中、3.2秒收爪；其余三招仍3秒。前倒数与伤害规则不变。
- 新增3条RED→GREEN，116条相关测试通过；浏览器完整播放验证，未提交/推送/部署。
- 详见 docs/sprints/bubble-court-cat-slow.md。

## 2026-10-18 — 后三招末端爆破慢放（本地）

- 用户澄清后，风车/黑洞/巨猫统一4秒，最后2200～3100ms动态爆破慢放；不再只巨猫前段变慢。双手重扣3秒不变。
- 123项相关测试通过；浏览器三招及接收方实际连贯回放，末端持续展开、4秒单次落灰恢复。
- 详见 docs/sprints/bubble-court-impact-slow.md；不提交、不部署。

## 2026-10-18 — 四招独立工作台（本地）

- 新增move-lab独立静态页面与隔离的纯动作runtime快照，localhost:8788不依赖游戏后端。
- 四招直接播放；支持暂停/重播/半速/时间轴/关键点/循环/示意特效开关，浏览器实际检查完成。
- 后续先只改工作台，视觉确认后再显式集成；本轮原对战无净改动，不提交、不部署。
- 详见 docs/sprints/bubble-court-move-lab.md。

## 2026-10-19～20 — 独立四招工作台 V2（本地）

- 六款官方竞品比较与设计取舍完成；调研页可从工作台打开。
- 后三招共享原创人物/手掌/道具；爆破时主体与落点同框；原球命中后才分四球。
- 基础扣篮补完贯网松手落地，后三招爆破完整淡出，四槽传出与四招连播可直接检查。
- 37相关测试、完整原速/半速、390×844与整组循环/手动退出通过；复审通过，原game48文件hash一致。
- 不集成对战、不提交、不部署；详见docs/sprints/bubble-court-move-lab-v2.md。

## 2026-10-21 — 公网双人模式与实玩

- 新增权威房间 Session、Node/Cloudflare适配、固定V2四招runtime、服务器控制演出与落灰；房间码/重连/持久化/限流/TTL回收。
- 实际两页正常射击蓄满首招、双向四招、连续Dunk、触底灰化结算、双方重赛和离线恢复已检查。
- 完整回归475项474通过，剩余既有旧3D手掌测试失败；新相关测试通过。发布预检发现并修正exports/migrations互斥，补红绿回归。
- 最终476项475通过，仍仅旧3D既有失败。隔离发布完成，现网真实两页自然蓄能、风车落4灰和恢复发射验收通过；线上禁充能与身份/房满检查通过。
- 现网 /bubble-court/duel/，版本3e5b2761；未commit/push。详见docs/sprints/bubble-court-online-duel.md及docs/evidence/online-duel-20261021/release.json。

## 2026-10-21 — 原房间一键重赛

- AC/架构/UI方案已记录：双人结束后任意一方一键重开，保留房间身份，3秒倒数；对手离线等待，重复请求只开一局。
- 4条新增RED→GREEN，相关19项通过，全套480项479通过（仅旧3D既有失败）。本地两页单方启动与离线返回通过；现网97C2RP只点A后两边round1→2、同步倒数。
- 已发布版本1f26be5e；详见docs/sprints/bubble-court-one-click-rematch.md和docs/evidence/rematch-20261021/；不commit/push。

## 2026-10-21 — 双方同意再战（取代真人一键重开）

- 用户确认双方邀请/接受/暂不，等待保留结算；DEMO01仍一键。AC及架构/UI方案见docs/sprints/bubble-court-consent-rematch.md。
- 新契约10条RED→GREEN，相关41项通过；全套486项485通过，仍仅旧3D既有失败。
- 本地/线上双页均验证邀请不清空、暂不保留、重新邀请/接受才开局；线上刷新保留邀请，新局双方可发射。DEMO01线上/本地均一键重开通过。
- 已发布c815671d，证据docs/evidence/consent-rematch-20261021/；不commit/push。

## English Duel — 2026-10-21
- [x] AC, architecture/UI approach and failing English contract tests recorded.
- [x] English lobby, instructions, actions, combat notices, results, consent controls and API errors.
- [x] Regression, mobile browser QA and isolated production release: 33 targeted tests passed; 487/488 full tests passed (known legacy 3D failure). Published 0db5a3fd; online English two-player rematch verified.

## Code curation and batch submission — 2026-10-21
- [x] Recorded acceptance criteria, dependency-aware commit boundaries and source map.
- [x] Verified Aaron Wang identity, Aaron SSH route and AW-Best remote.
- [x] Added portable development/testing commands via RED→GREEN command-contract test.
- [x] Verified staged snapshots and prepared four dependency-aware batches; push verification recorded after submission. No deployment.
- [x] Batch 1 `e425635`: shared foundation; isolated 173/173 targeted tests.
- [x] Batch 2 `1a38883`: independent workbench and pinned approved runtime; isolated 193/193 accumulated tests.

- [x] Batch 3 `f0e640c`: English online duel/solo/consent rematches; isolated 233/233 duel + 10/10 deployment tests, build dry-run passed.
- [x] Batch 4: rules/source map/history/evidence curated; unrelated AdSense report excluded. Full suite 488/489; original HEAD reproduces the same legacy 3D failure.
