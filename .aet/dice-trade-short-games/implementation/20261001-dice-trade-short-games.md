# Dice Motion, Trade Alerts, and Short Games — Implementation Record

## Delivered

- Rebuilt the dice motion as a staged launch, tumble, court impact, rebound, and settle sequence while preserving the server result.
- Added a synchronized, recipient-only trade notification with sender, offer summary, dismiss action, and direct access to the Trade Desk.
- Added 3-minute and 5-minute match choices and enforced them in the game core, Node room service, and Cloudflare Worker.
- Added compact mobile positioning for the trade notification and bumped the browser asset version.

## Verification

- Focused feature suite: 77/77 passing.
- Full suite: 122/122 passing.
- Reduced-motion behavior remains covered by the existing global motion override.
