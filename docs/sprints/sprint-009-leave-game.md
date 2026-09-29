# Sprint 009 — Leave Game

## Acceptance criteria

- Every player sees **Leave Game / New Game** during a match.
- The browser asks for confirmation before leaving.
- Leaving closes live updates, stops local timers, and removes the saved room identity.
- The room code is removed from the URL.
- The same browser immediately returns to the Create/Join screen.
- Leaving locally does not end the room for other players.

## Test case

- Interface source contains the control and wires it to complete local-session cleanup.
