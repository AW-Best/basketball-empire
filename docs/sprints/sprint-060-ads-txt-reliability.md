# Sprint 060 — ads.txt Reliability

## Goal

Keep the AdSense authorization file available during static asset deployment and cache transitions.

## Acceptance criteria

- `GET /ads.txt` returns HTTP 200 and the authorized publisher record.
- The response is plain text and does not depend on the static asset binding.
- Cloudflare runs the Worker first for `/ads.txt`.
- The complete automated test suite passes.

## Tasks

- [x] Reproduce the static-asset dependency with a failing Worker test.
- [x] Add a dedicated Worker response for `/ads.txt`.
- [x] Route `/ads.txt` through the Worker before static assets.
- [x] Run the complete 189-test suite.
- [ ] Deploy and verify the production response.
