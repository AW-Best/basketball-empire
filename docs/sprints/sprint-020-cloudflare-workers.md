# Sprint 020 — Cloudflare Workers Runtime

## Goal

Add a Cloudflare-hostable version of Basketball Empire without removing or changing the existing local Node.js version.

## Acceptance criteria

- The current Node.js release is recoverable from a GitHub tag.
- Static game assets and `/api/*` deploy as one Worker project.
- A room survives separate requests inside a SQLite-backed Durable Object.
- Create, join, ready, start, and authenticated action URLs remain compatible with the current frontend.
- Timed games and auctions have Durable Object alarm support.
- When SSE is unavailable, all clients continue through the existing polling fallback.
- A developer can verify the build, website, and a two-player room locally before deploying.

## Test cases

- Health and static-asset routing.
- Create and join a persistent room.
- Ready and start through bearer-token authentication.
- Explicit polling fallback response for the events route.
- Wrangler configuration includes Assets, `ROOMS`, and SQLite storage.
- Wrangler dry-run bundles the Worker and all public assets.
- Wrangler local runtime creates and joins a real room through HTTP.
