# Basketball Empire

Basketball Empire is a private, non-commercial, real-time basketball board game for 2–4 friends. Players create or join a room, enter their full names, ready up, and play synchronized turns from a phone or desktop browser.

Public game: https://basketball-empire.basketball-empire.workers.dev

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
