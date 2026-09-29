# Sprint 008 — Dice, Auction, and Recruiting

## Acceptance criteria

- Every new roll replays a clearly visible standard dice-tumble animation.
- The dice interaction contains no basketball-shot treatment or basketball icon.
- An auction begins with five seconds and every valid bid resets it to five seconds.
- Selecting **Recruit** on an owned Team Card opens the Scouting Board.
- The selected team is preselected for every eligible prospect.
- Existing game, room, and interface tests remain green.

## Test cases

- Engine auction timestamps are exactly five seconds after a decline or bid.
- Room timers schedule auction settlement after five seconds.
- Lobby and live auction copy display the five-second rule.
- UI source wires every new roll to the dice animation.
- Team-card recruiting routes to named prospects instead of submitting an unnamed recruit.
