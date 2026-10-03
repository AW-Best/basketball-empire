# Sprint 041 — Hoopire Custom Domain

## Goal

Make `hoopire.com` the production custom domain for Basketball Empire while retaining the existing Workers development address.

## Acceptance Criteria

- [x] Wrangler declares `hoopire.com` as a Worker Custom Domain.
- [x] Cloudflare creates and manages the DNS record and TLS certificate.
- [x] The homepage, multiplayer API, `ads.txt`, `robots.txt`, and privacy page work through HTTPS on `hoopire.com`.
- [x] The existing `play.basketball-empire.workers.dev` address remains available.
- [x] The automated test suite passes.

## Architecture

Treat `wrangler.jsonc` as the deployment source of truth. Add an apex Custom Domain route with `custom_domain: true`; the Worker remains the origin for all paths and Cloudflare manages DNS and certificates automatically.

## TDD Plan

- [x] Add a failing deployment contract for the exact Custom Domain.
- [x] Add the route to Wrangler configuration.
- [x] Run all tests and commit the configuration.
- [x] Verify DNS, TLS, application assets, multiplayer API, and AdSense files.
