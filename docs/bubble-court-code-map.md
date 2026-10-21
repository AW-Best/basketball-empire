# Bubble Court source map

The current player-facing entry is `/bubble-court/duel/` (English). `/bubble-court/duel/?room=DEMO01` runs the same rules against a local bot. The older `/bubble-court/` game remains separate.

| Area | Responsibility |
| --- | --- |
| `public/bubble-court/duel/index.html`, `lobby.mjs` | English lobby, room creation/joining, invitations and help |
| `public/bubble-court/duel/game.mjs` | Board input/rendering and match UI; consumes authoritative snapshots |
| `public/bubble-court/duel/network.mjs` | Authenticated requests, retries and server/visual clock synchronisation |
| `public/bubble-court/duel/mock.mjs` | DEMO01 bot and practice-only controls |
| `public/bubble-court/duel/rematch.mjs`, `ending.mjs`, `feedback.mjs` | Consent controls, result transition and combat copy |
| `public/bubble-court/duel-lab/model.js`, `Constants.js` | Shared pure rules and board geometry; the legacy folder name is retained for import compatibility |
| `src/bubble-duel-session.mjs` | Authoritative room identity, clocks, idempotent actions and consent validation |
| `src/bubble-duel-http.mjs` | Shared HTTP boundary, origin/body checks and room creation limits |
| `src/bubble-duel-server.mjs` | Local Node adapter; defaults to the online session rules |
| `cloudflare/bubble-duel-room.mjs` | Durable Object persistence/expiry; routed from `cloudflare/worker.mjs` |
| `public/bubble-court/duel/runtime-v2/` | Pinned approved motion runtime used by the live match; VERSION.json records its source hashes |
| `public/bubble-court/move-lab/` | Independent four-move workbench with its own runtime; no room or game dependency |
| `public/bubble-court/duel/moves/`, `duel-lab/slam/` | Original adapters and earlier motion studies; retained for regression coverage |
| `public/bubble-court/duel/design/`, `action-library/`, `duel-lab/animation/` | Earlier UI/animation review pages; development material, not online room entry points |
| `docs/bubble-court-duel-rules.md` | Current gameplay rules |
| `docs/sprints/bubble-court-*.md` | Historical requirements, decisions and verification notes; later records supersede earlier variants |
| `docs/evidence/`, `docs/research/` | Selected visual/release evidence and motion references |

## Run and verify

From the repository root with Node 20 or newer:

```sh
npm install
npm run dev:duel
```

Open `http://localhost:8780/bubble-court/duel/`. Two phones on the same Wi-Fi can use the computer LAN address. The local server defaults to port 8780 and all interfaces; `HOST=127.0.0.1` limits it to the local computer. DEMO01 needs no second device.

```sh
npm run test:duel
node --test test/deployment.test.js
npm test
python3 public/bubble-court/move-lab/serve.py
```

The last command opens the independent workbench at `http://localhost:8788/`. It binds loopback only. No build or backend is needed for that workbench.

Full `npm test` also covers the older single-player 3D game. At curation time its pre-existing athlete test fails with `palm misses the rim`; the new duel suite must remain green. Do not delete/skip that test to make the total look green.

## Changing an animation

Iterate in `move-lab/runtime/` and inspect the whole action, impact and transfer. Integrate approved changes into `duel/runtime-v2/` explicitly, update its manifest and reverify combat clocks. The duplicated snapshots are intentional isolation boundaries; deduplicating them would couple experiments to the game.

## Git submission and production

Commits use Aaron Wang's repository identity and `origin` (`github-aaronwang2030:AW-Best/basketball-empire.git`). The configured key authenticates to GitHub as AW-Best. Pushing does not deploy the site.

The last verified live English release is `0db5a3fd-0f8a-4e4c-8ecc-f49ddce23b2f`. Historical release packages used an explicit 122-file static asset set, keeping development-only preview pages out. The root `deploy:cloudflare` command deploys the entire configured `public/` directory, including checked-in labs; do not use it to reproduce that curated live release blindly. Prepare/review an isolated release package and verify its asset diff before an authorised deployment. This code curation performs no deployment.
