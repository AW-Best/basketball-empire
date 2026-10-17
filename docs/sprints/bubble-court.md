# Bubble Court mobile practice
Acceptance: tap target to aim; relative fine ruler never jumps on press/release; separate Shoot; no duplicate in-flight shots; remaining bubbles touching red launch boundary end play; Game Over and replay; existing modes retain behavior.
Architecture: independent static ES-module mode under public/bubble-court; shared asset worker unchanged. Source and behavior tests live in this repository. No new account, billing, or backend data.
Implementation: mode hub link, Canvas shooter/court, pure controls/engine/motion/effect modules. Integration tests written and observed failing before copying assets. All 214 repository tests passed including 19 original prototype behavior tests and 2 new integration tests.
Self architecture/UI/security review: bounded local game state, no new network calls; explicit DOM control IDs; static source only. Real-phone performance and user feel still need device verification.

Quick-mode revision: tap/drag-release launches directly; secondary/cancelled pointer cannot shoot; precision controls hidden by default, independently expandable. Responsive bubble sizing keeps initial groups above the danger line on short viewports. Tests: tap/drag release once, cancellation, secondary pointer, precision release preserves aim; 216 full-suite passes.
