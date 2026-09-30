# Sprint 019 — Auction Layer Regression Fix

## Diagnosis

- **Symptom:** Full Game History renders on top of the live auction bid area.
- **Severity:** High; bid information becomes difficult to read and use.
- **Reproduction:** Start an auction while the center-court history contains entries.
- **Root cause:** `#auction-panel` is nested inside `.possession` (`z-index: 2`), while `.court-history` is a sibling stacking context at `z-index: 3`. The auction's `z-index: 80` cannot escape its lower parent stacking context.
- **Affected files:** `public/index.html` (modal location), `public/styles.css` (root overlay isolation), and `test/ui.test.js` (regression contract).
- **Risk:** Low. Auction IDs and event listeners remain unchanged; only the overlay mount point and top-level stacking are corrected.

## Fix plan and acceptance criteria

- [x] RED: require the auction overlay to mount after the game stage at the page root.
- [x] Move the existing auction markup outside all board stacking contexts.
- [x] Give the fixed overlay an isolated, page-level modal layer.
- [x] Verify history, cards, and balance callouts remain below the auction.
- [x] Run the complete suite.
- [ ] Publish the fix.
