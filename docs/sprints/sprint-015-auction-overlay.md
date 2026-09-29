# Sprint 015 — Full Auction Overlay

## Acceptance criteria and design

- [ ] Auctions open a prominent synchronized overlay for every player.
- [ ] The overlay shows asset identity, current bid, leading bidder, a five-second progress bar, and recent bid activity.
- [ ] Bid buttons display both the resulting total and the +2, +50, or +100 increment.
- [ ] An asset card shows purchase price, mortgage value, and team/route/lab revenue details.
- [ ] The layout collapses cleanly to one column on phones.

The design borrows the reference’s strong two-column information hierarchy but uses Basketball Empire’s arena navy, cyan, orange, and cream palette. Existing server-authoritative bidding and reset timing are unchanged.

## TDD plan

- [x] Write and run failing UI tests.
- [x] Implement the auction overlay rendering and responsive styling.
- [x] Run the full suite, commit, push, and deploy.
