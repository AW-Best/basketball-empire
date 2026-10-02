# Sprint 040 — AdSense Verification Hardening

## Diagnosis

Production returned HTTP 200 to Googlebot, Mediapartners-Google, and Google-Display-Ads-Bot. Each response contained the correct AdSense script, and `/ads.txt` returned the authorized publisher entry. The remaining likely causes are crawler/index delay or a site-address mismatch in AdSense.

## Acceptance Criteria

- [x] The homepage includes Google's supported `google-adsense-account` meta verification tag.
- [x] A root `robots.txt` explicitly permits Google, AdSense, and display-ad crawlers.
- [x] The AdSense script and ads.txt authorization remain unchanged.
- [x] The complete automated suite passes.

## TDD Plan

- [x] Add failing contracts for the meta tag and crawler rules.
- [x] Add the minimum verification files.
- [ ] Verify, commit, deploy, and test using Google crawler user agents.
