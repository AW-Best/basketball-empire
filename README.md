# Basketball Empire

Basketball Empire is a private, non-commercial, real-time basketball board game for 2–4 friends. Players create or join a room, enter their full names, ready up, and play synchronized turns from a phone or desktop browser.

Public game: https://play.basketball-empire.workers.dev

## Run locally

Requirements: Node.js 20 or newer. There are no third-party runtime dependencies.

```bash
npm start
```

Open `http://localhost:4173`. The server listens on all network interfaces, so devices on the same Wi-Fi can also open `http://<computer-lan-ip>:4173`.

## Play

1. One player creates a room and shares the invite link or six-character room code.
2. Two to four players enter their own names and click **I'm Ready**.
3. The host starts the match.
4. On your turn, roll the server-controlled dice. If you land on an unsigned team, sign it for the fixed price or pass; passing never starts an auction.
5. Complete divisions to recruit Star Players. Owned, undeveloped teams can be mortgaged from their team cards.
6. End your turn so the next player can act. The first player to complete the target number of laps is announced as champion.

## Test

```bash
npm test
```

The test suite covers rules, room authorization, HTTP endpoints, live SSE state delivery, and responsive UI structure.

## Run the Cloudflare version locally

Install the development dependency once, then start Cloudflare's local Workers and Durable Objects simulator:

```bash
npm install
npm run dev:cloudflare
```

Open `http://localhost:8787`. To test two players on one computer, create a room in one normal browser window and open its invite link in a private/incognito window or a different browser. Each window keeps separate player credentials.

Useful checks:

```bash
curl http://localhost:8787/api/health
npx wrangler deploy --dry-run
```

The Cloudflare version uses the same frontend and REST API as the Node.js version. Each room is stored in its own SQLite-backed Durable Object. The browser falls back to a two-second state poll on Cloudflare; the Node.js server continues to use server-sent events.

To publish after signing in to Cloudflare:

```bash
npx wrangler login
npm run deploy:cloudflare
```

## Share with friends

The current private-play URL is `https://macpro.tail86c614.ts.net/`, exposed through Tailscale Funnel. Keep this Mac awake with both Tailscale and `npm start` running while friends play.

Rooms are held in server memory for this first playable version. Restarting the Node.js server clears active rooms. GitHub Pages is not used because the multiplayer room service needs a running server.

## Deploy to Render

The included `render.yaml` defines a free Node.js web service with `/api/health` as its health check. Connect this repository to Render and deploy it as a Blueprint. Render supplies the `PORT` environment variable automatically, and the server already reads it.

Free Render services may sleep when idle. Because rooms are held in memory, sleeping, restarting, or redeploying the service clears active rooms.

## Bubble Court

Sunset Court is a solo 3D basketball bubble challenge at `/bubble-court/`: land 3 dunks in 30 shots. Tap a target to shoot, or hold/drag/release to aim. Fine aim remains optional. Match 3+ bubbles to charge DUNK; rim impact clears the deepest occupied row without generating energy. Danger-line contact loses. A charged final shot still permits one last dunk. Win/loss show stats, efficiency stars and replay; local best shot count persists. The ? button reopens the first-visit guide. COPY CHALLENGE LINK copies a run summary for the player to paste; nothing is automatically posted.

Source: `public/bubble-court/`. Tests: `test/bubble-court.test.js` and `test/bubble-court/`. Run `npm test` before release.

### Production release

1. Commit as Aaron Wang using this repository's local Git identity.
2. Push to `origin` (`github-aaronwang2030:AW-Best/basketball-empire.git`). The SSH host alias chooses the configured key; GitHub reports its authenticated identity as AW-Best.
3. Run `npm run deploy:cloudflare` with the authorized Cloudflare login. This invokes `wrangler deploy`, deploying `cloudflare/worker.mjs` and `public/` using `wrangler.jsonc`.
4. Verify `https://hoopire.com/bubble-court/index.html` and the existing modes. GitHub push alone does not deploy: no automatic deployment workflow is configured in this checkout.

The separate chatgpt.site prototype is hosted through Sites and has its own source/version/deployment workflow; it is not the production Hoopire deployment.

Bubble Court now defaults to quick controls: tap the board to fire; hold and drag to aim, release to fire. Moving outside the board/launch area cancels. The optional Fine aim toggle expands the previous ruler and explicit SHOOT controls. Launch-zone failure and +2 dunk scoring remain; the new challenge wraps them with a finite goal.

### 3D mobile rendering
The local Three.js scene uses an original procedural street court and a locally served Quaternius CC0 skinned athlete. The athlete has65bones and a named quaternion AnimationClip with an original dunk: fixed bone offsets/scales, planted support feet, palm-attached basketball and landing compression. Teal uniform materials, hair and sneakers replace the previous stretching primitive figure. It caps DPR at1.5 and its drawing buffer at240,000pixels, renders idle at15fps and active at up to60fps with a30fps slow-frame fallback. No realtime shadow maps, postprocessing, remote model downloads or CDN are needed. Background/guide pause simulation; reduced-motion avoids camera movement. Unsupported or lost WebGL2 falls back to the existing2D animation with the same impact/completion clock. These are rendering limits, not a frame-rate guarantee on every phone.

Try390×844 and320×568 layouts, play a full three-dunk win, trigger danger failure, replay, reopen Help and check no stats change during preview. Run `npm test` before release. Implementation/design: `docs/sprints/bubble-court-3d.md`.

### Skinned athlete validation (v10)
Asset provenance and hash: `public/bubble-court/assets/CREDITS.md`. The GLB is741,320bytes; Node scene verification totals17,544triangles/33mesh draw objects before browser-only lettering. GLTFLoader and BufferGeometryUtils are same-version local Three.js helpers. Model loading has a10-second timeout to2D fallback; disposal releases shared skeleton textures once.

`test/bubble-court/athlete.test.js` samples the actual loaded skin and mixer for invariant segment lengths/offsets/scales, running/gather/landing contacts, approach momentum, hand-ball release continuity, rim contact, asset budget and timeout/resource cleanup. Developer browser QA at390×844 and320×568 inspects approach/gather/rise/impact/recovery and a real energy-charged dunk/row clear, not just geometry assertions. Original authored motion is not mocap.
