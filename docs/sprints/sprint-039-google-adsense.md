# Sprint 039 — Google AdSense Foundation

## Goal

Connect Basketball Empire to the owner's Google AdSense account and publish the supporting transparency files without disrupting the game interface.

## Acceptance Criteria

- [x] Every game page loads the official asynchronous AdSense script for publisher `ca-pub-6603520082677971`.
- [x] `/ads.txt` identifies Google as the direct advertising system for publisher `pub-6603520082677971`.
- [x] A public privacy page explains Google advertising, cookies, local browser storage, room/avatar processing, choices, and retention.
- [x] The global footer links to the privacy page.
- [x] Existing game controls and mobile layout remain unchanged.
- [x] The complete automated test suite passes.

## Architecture and Compliance Approach

Use AdSense Auto ads through the single asynchronous script Google supplied. Keep ad placement under AdSense control rather than inserting fixed units into the board. Publish `ads.txt` and a static privacy page from the existing Cloudflare Assets bundle. Consent messages for the EEA, UK, and Switzerland must be configured in AdSense Privacy & messaging using Google's certified CMP; the site code must not imitate or replace that account-level configuration.

## TDD Plan

- [x] Add failing deployment and UI contracts for the publisher script, `ads.txt`, privacy page, and footer link.
- [x] Add the minimum static assets and responsive styling.
- [x] Run the focused and complete test suites.
- [x] Commit, deploy, and verify all public URLs.
