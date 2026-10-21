# Bubble Court code curation and batch submission

Request: organise existing code and submit it to AW-Best using Aaron Wang. Publishing gameplay changes is outside this task.

## Acceptance / architecture review

- Keep the deployed English duel behaviour, rules, approved animation snapshots and consent-based rematch unchanged.
- Separate shared model/animation foundations, independent motion workbench, online integration and documentation into reviewable commits. Include their tests and required import dependencies in the same or earlier commit.
- Provide portable local run/test instructions and a module map. Preserve the historical lab paths because tests and imports depend on them; avoid moving shared modules during a submission-only cleanup.
- Keep `.spike`, build outputs, credentials and unrelated AdSense evidence out of these commits. Keep relevant research and checked visual evidence under docs.
- Use the existing Aaron Wang local Git identity and configured `github-aaronwang2030` SSH route to AW-Best/basketball-empire. No force push, history rewrite, automatic deployment or unrelated account changes.

The existing README explicitly records that this Aaron SSH route authenticates as the GitHub login AW-Best. Verified the route and remote head before staging. The graphify report and command, and ~/.Codex/TEAM_WORKFLOW.md, are absent; no graph update is claimed.

## Batches

1. Shared duel model, local preview, original comic/SVG motion, move timing and unit tests.
2. Independent four-move workbench, approved pinned runtime, role-design preview and motion tests.
3. English browser game, solo mock, authenticated two-player server/Cloudflare integration, rematch consent and focused developer commands.
4. Current rules, module map, historical sprint/research notes and relevant release/visual evidence.

Each staged snapshot is checked separately so unstaged files cannot hide missing dependencies. Full regression is also run before commits; existing unrelated failures are reported explicitly.

## Verified batch progress

- Foundation `e425635`: isolated staged tree passed 173 targeted tests; full snapshot 426/427, only known baseline athlete failure.
- Workbench `1a38883`: isolated staged tree passed 193 accumulated targeted tests; full snapshot 446/447, same baseline failure. One whitespace-only line cleaned in the original blackhole adapter; pinned snapshots untouched.

- Online `f0e640c`: isolated staged tree passed 233 duel tests and 10 deployment tests; full 488/489 with the same untouched baseline athlete failure. All 122 JS modules passed syntax/static import resolution; 20 pinned runtime hashes match. Cloudflare dry-run succeeded without deploying.
- Documentation batch includes the current rulebook/source map, historical iteration notes, motion research and relevant selected visual/release evidence. The unrelated AdSense report remains untracked and unchanged. All existing local commits, including the earlier standalone comic-win prototype, are carried forward without rewriting history.
