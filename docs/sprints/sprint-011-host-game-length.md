# Sprint 011 — Host Game Length

## Acceptance criteria

- The host can choose 10, 15, 20 minutes, or Unlimited before starting.
- Non-host players can see the control but cannot change it.
- The server validates and authoritatively applies the chosen duration.
- Every client receives the selected duration in the shared room state.
- Unlimited matches show an infinity clock and never finish because of elapsed time.
- The host may still end any active match manually.

## Test cases

- Game engine accepts only 600, 900, 1200 seconds, or `null` for Unlimited.
- Unlimited games remain active regardless of elapsed time.
- Room and HTTP integration tests preserve the host-selected duration.
- UI exposes all four choices and sends the selection when starting.
