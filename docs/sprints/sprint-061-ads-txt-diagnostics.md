# Sprint 061 — ads.txt diagnostics

## Acceptance criteria (Scrum)

- GET and HEAD /ads.txt emit one bounded structured diagnostic with event, timestamp, method, hostname, path, userAgent, rayId and status.
- Response body, status, content type and cache policy remain unchanged.
- Do not log IP, query, cookies, authorization or request body. Other routes do not emit this event.
- Persist console logs with automatic invocation logs disabled.
- Run all tests, validate Wrangler deployment and verify a production diagnostic.

## Architecture approval

Independent /arch review approved the minimal console event and Workers Logs approach on 2026-10-16. No database or external log service. Status comes from the constructed response; headers are length bounded. Review covered data minimization; no payment data or game data is involved.

## Evidence limits and operations

Cloudflare dashboard → Workers & Pages → play → Observability, filter message/event for ads_txt_request. User-Agent can be forged; this alone does not authenticate Google. The event means the Worker generated a response, not that a client received it. WAF blocks before the Worker require Security Events inspection. Missing logs do not prove no requests: retention, ingestion limits and log delivery can affect results.

Workers Logs has short retention (currently Free 3 days / Paid 7 days); query or export promptly, rather than waiting a week. Do not use query parameters as a test marker; use User-Agent Hoopire-AdsTxt-Diagnostic-Test and Ray ID to distinguish our probes from crawlers.

## Tasks

- [x] RED: GET/HEAD logging tests fail because no event is emitted; persistence configuration absent.
- [x] Implement bounded event and explicit persistence config.
- [x] Full test suite: 193 passing; Wrangler 4.145.0 dry run passes.
- [x] Independent quality/security and privacy engineering review; no blocking findings.
- [x] Production GET/HEAD return 200; tail shows both diagnostic events. Workers dataset confirms persisted HEAD event at 2026-10-16 11:55:12 GMT+8 with test UA and status 200.
- [x] Implementation commit 98fc4c0 deployed as Worker version 71f05fac-9c65-4ce0-bb80-b60de8d1b831.

User subsequently requested no TDD workflow for this task; tests already completed were retained, with remaining verification performed directly in production.
