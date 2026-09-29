# Sprint 007 — Render Deployment

## Goal

Deploy Basketball Empire as a free Render web service so players can join from different networks without depending on the host Mac.

## Acceptance criteria

- The repository contains a Render Blueprint for a free Node.js web service.
- Render starts the application with `npm start`.
- Render checks `/api/health` to determine service health.
- The complete automated test suite passes before deployment.
- The deployed HTTPS URL serves the game and its JSON health endpoint.

## Operational note

Rooms currently live in server memory. A Render restart, redeploy, or free-tier sleep clears active rooms.

