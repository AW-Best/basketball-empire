# Sprint 002 — Live Auctions

## User story

When the player who lands on an available team, route, or lab passes, the other active players can compete to buy it in a short live auction.

## Acceptance criteria

- Passing starts a synchronized five-second auction.
- The player who passed cannot bid.
- Other active players can increase the high bid by 2, 50, or 100 points.
- A player cannot bid more points than they currently hold.
- Every valid bid resets the countdown to five seconds for all players.
- After five seconds without a bid, the high bidder pays and becomes the owner.
- With no bids, the asset remains available and the current turn may end.
- Auction bids, winners, and unsold results appear in game history.

## Test cases

- Engine starts auctions and validates bidders and increments.
- Engine resets the deadline and transfers the asset after expiry.
- Room service schedules and reschedules automatic completion.
- Interface includes live bid controls, leader, high bid, and countdown.
