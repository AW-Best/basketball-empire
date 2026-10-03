# Sprint 042 — Initials-Only Avatars

## Goal

Simplify room entry by removing optional photo upload and camera controls.

## Acceptance criteria

- Create and Join forms contain no avatar upload or camera controls.
- New room requests send only the player's name and use generated initials.
- Existing room data containing legacy photo avatars remains renderable.
- All automated tests pass before deployment.

## Architecture and UI approval

Remove only the client-side photo input, compression, and submission path. Preserve the existing avatar renderer and server compatibility so active legacy rooms are not broken. The shorter forms keep the current Basketball Empire visual system without replacement UI.
