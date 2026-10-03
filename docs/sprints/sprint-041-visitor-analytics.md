# Sprint 041 — Visitor Analytics

## Goal

Give the owner private traffic analytics in Cloudflare and show players a small public visit total on the Basketball Empire home screen.

## Acceptance criteria

- Cloudflare exposes a same-origin `POST /api/visits` endpoint backed by one global Durable Object.
- A browser contributes at most one public visit per UTC day, using a first-party cookie; no name, IP address, or game data is stored by the counter.
- The endpoint returns the current non-negative visit total and sets a secure, same-site cookie on a new daily visit.
- The home screen displays the total in a compact arena-scoreboard treatment and handles unavailable analytics without blocking play.
- Cloudflare Web Analytics is enabled for `hoopire.com` so the owner can privately inspect traffic and performance.
- Automated tests cover counter incrementing, daily deduplication, UI markup, client loading, and deployment bindings.

## Architecture approval

Approved design: a dedicated global `VisitorCounter` Durable Object provides atomic increments. The browser calls a same-origin endpoint, and a short first-party daily cookie prevents ordinary refreshes from inflating the total. Cloudflare Web Analytics remains independent of the public counter and is enabled using Cloudflare's automatic, privacy-first integration.

## UI design approval

The counter appears as a restrained “arena attendance” scoreboard in the site legal footer. It uses the existing navy, cyan, orange, and condensed-display typography, remains legible on mobile, and never competes with the primary room actions.

## Test cases

1. First visit increments and returns the public total.
2. A repeat request carrying today's cookie returns the same total.
3. A new visitor increments the shared total.
4. Homepage includes an accessible visit counter.
5. Client fetches the counter without breaking the game if the request fails.
6. Wrangler configuration binds the global visitor Durable Object.
