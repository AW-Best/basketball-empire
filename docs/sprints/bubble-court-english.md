# English Bubble Court Duel

Request: make the current game English. Keep the multiplayer rules, DEMO01 and consent rematch flow. Publish verified changes to hoopire.com; no Git commit or push.

## Acceptance and design

- English lobby, room invitations, mobile controls, accessibility labels, guide, four move choices, attack ownership, warning, result and rematch states.
- Concise mobile copy; normal score/energy stays in the HUD. Use junk bubbles consistently for grey interference bubbles.
- Both players must still agree to a rematch; DEMO01 keeps one-tap replay.
- English recoverable API errors. IDs, persisted state, timings and motion assets stay compatible.

Architecture/UI review: direct copy replacement in current entry modules, no new language framework or protocol changes. Retain pinned motion runtime and existing layout; check longer English text at phone width. No schema/storage migration. The existing graphify report/tool remains unavailable.

TDD: English contract tests run first and fail on lang=zh-CN and Chinese rematch label. Then translate copy and update existing copy expectations while retaining their behavioral assertions. Review before browser QA.

## Verification and release

- Self-review before QA confirmed the release diff changes copy/lang only: no protocol, timing, model or motion-runtime changes. API status codes and validation unchanged. 8 frontend files + 3 backend error-copy files; 122 static files retained. Local Node server errors translated separately and excluded from production package.
- 33 targeted tests pass. Full regression: 488 total, 487 pass. Existing legacy athlete test still fails with `palm misses the rim`; that old 3D implementation was not changed.
- Local 390×844: board and controls fit; all four English move choices, outgoing warning, defeat fade, Play Again and guide verified.
- Online room 2YCUAW: two pages joined A/B, both readied, A shot until danger-line defeat; A invited, B received Accept Rematch / Not Now while preserving the result. B accepted; original room entered round 2 countdown with 0 scores and shots. Test tabs closed afterwards.
- Published version `0db5a3fd-0f8a-4e4c-8ecc-f49ddce23b2f`, predecessor `c815671d-c66b-44e7-8c35-02f492cebed1`. All 8 public UI assets match release SHA256. DEMO01 live English page opened and retained; console warnings/errors empty.
- Screenshots and release evidence: `docs/evidence/english-duel-20261021/`. No Git commit/push. Temporary mobile viewport reset. Cloudflare deploy command reference checked at https://developers.cloudflare.com/workers/wrangler/commands/ .
