# Cloudflare Workers Architecture v0.1

## Decision

Keep the existing Node.js runtime intact and add a second deployment target built on Cloudflare Workers. This makes the migration reversible: `npm start` still runs the original server, while `npm run dev:cloudflare` runs the edge version.

## Request flow

1. Cloudflare Static Assets serves files from `public/`.
2. Requests under `/api/*` run through `cloudflare/worker.mjs` first.
3. `/api/health` is answered directly by the Worker.
4. Creating a room generates a six-character code and addresses a Durable Object with that code.
5. Every later room request is routed to the same `BasketballRoom` object.
6. The Durable Object serializes room mutations and persists the game, host identity, and authentication-token mapping.

## State and timers

Each room uses a SQLite-backed Durable Object namespace. The game state is stored through the Durable Objects key-value API on top of that SQLite backend. Auction deadlines and timed-match endings schedule Durable Object alarms so state can complete without a permanently running Node.js process.

The existing frontend REST contract is unchanged. The first Cloudflare release intentionally returns `501` for the SSE endpoint, causing the existing client to use its tested two-second polling fallback. This avoids holding a long-lived connection per player while preserving synchronized play.

## Security boundaries

- Player tokens remain server-side credentials and are removed from public room snapshots.
- Only `/api/*` invokes game code before asset delivery.
- Request bodies retain the existing 64 KiB limit.
- Room mutations are serialized by the room's Durable Object.
- Static files and API data stay on the same HTTPS origin, so no CORS exception is required.

## Local and production verification

- Unit/integration suite: `npm test`
- Cloudflare bundle validation: `npx wrangler deploy --dry-run`
- Local runtime: `npm run dev:cloudflare`, then open `http://localhost:8787`
- Production: `npx wrangler login`, then `npm run deploy:cloudflare`

Active rooms created locally are local-only. Production rooms live in Cloudflare Durable Object storage and are not shared with the Node.js server or another Wrangler local session.
