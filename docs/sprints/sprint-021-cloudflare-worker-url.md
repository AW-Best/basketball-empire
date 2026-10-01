# Sprint 021 — Short Cloudflare Worker URL

## Goal

Rename the production Worker from `basketball-empire` to `play` so the public game URL is concise and the existing Durable Object data remains attached to the same Worker service.

## Acceptance criteria

- The Wrangler configuration names the Worker `play`.
- The public game is available at `https://play.basketball-empire.workers.dev`.
- GitHub deployments continue to publish the `main` branch to the renamed Worker.
- The README displays the new public URL.
- Existing rooms and Durable Object storage are preserved by renaming the Worker service instead of creating an unrelated service.

## Task 1: Rename and verify the Worker

**Files:**
- Modify: `test/deployment.test.js`
- Modify: `wrangler.jsonc`

- [x] **Step 1: Write a failing test for the `play` Worker name**
- [x] **Step 2: Run the deployment test and verify the expected failure**
- [x] **Step 3: Rename the existing Cloudflare Worker service and update Wrangler**
- [x] **Step 4: Run the deployment test and full suite**
- [x] **Step 5: Commit the tested configuration change**

## Task 2: Publish and document the new URL

**Files:**
- Modify: `README.md`
- Modify: `SPRINT-STATUS.md`
- Modify: `docs/sprints/sprint-021-cloudflare-worker-url.md`

- [x] **Step 1: Update the public URL documentation**
- [x] **Step 2: Push `main` and verify the GitHub deployment**
- [x] **Step 3: Verify the public page and health endpoint**
- [x] **Step 4: Commit the completed sprint record**
