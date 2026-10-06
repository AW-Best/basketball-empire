# Sprint 050 — Buzzer Leaderboard and Level Roadmap

## Goal

Add a persistent all-time Top 5 to Buzzer Beater, offer qualifying players a privacy-conscious nickname choice, and define a scalable level sequence.

## Architecture approval

- Use one global Cloudflare Durable Object for the production leaderboard.
- Keep only five sorted entries; later equal scores do not displace an earlier equal score.
- Provide the same API in the local Node server for development.
- Validate score bounds and sanitize nicknames on the server.
- Fetch the board before deciding whether a finished run qualifies.

## UI and privacy approval

- Show Top 5 in the Buzzer HUD without covering the court.
- Ask only qualifying players whether to save a nickname or remain Anonymous.
- Limit nicknames to 16 characters and explain public retention in the privacy policy.

## Acceptance criteria

- [x] Historical scores persist globally in production.
- [x] Only the five highest scores are returned.
- [x] A qualifying player sees a nickname/Anonymous choice.
- [x] Unsafe nickname markup and impossible scores are rejected or sanitized server-side.
- [x] Desktop and mobile layouts expose the leaderboard without blocking shooting controls.
- [x] Local development supports the same endpoints.

## Recommended level sequence

| Level | Name | Goal | New mechanic |
|---|---|---|---|
| 1 | Warm-Up | Make 4 in 60 seconds | Fixed centered rim; teaches drag and release |
| 2 | Side Step | Make 4 in 60 seconds | Rim moves horizontally |
| 3 | Elevator | Make 5 in 55 seconds | Rim moves vertically between two heights |
| 4 | Deep Range | Make 5 in 50 seconds | Ball starts from farther left/right three-point spots |
| 5 | Tight Window | Make 6 in 45 seconds | Rim is visually and physically narrower |
| 6 | Clutch Mix | Make 7 in 40 seconds | Alternates horizontal motion, height, and deep-range starts |

## Design rationale

- Introduce one mechanic per level so failure teaches a clear skill.
- Increase the goal only after the player has learned the new motion pattern.
- Keep each level under one minute for quick retries on mobile.
- Use the final mixed level as the score-separating challenge for the global leaderboard.

## Test cases

- Six submissions retain the five highest scores in descending order.
- Nicknames are trimmed, length-limited, and stripped of angle brackets.
- Scores outside the accepted integer range fail.
- A score qualifies when fewer than five entries exist or it beats fifth place.
- Anonymous submission stores no player-entered nickname.
