# Build note

## Current stage

Plan/Design approved by the user on 2026-11-15. The user later approved UI alignment option A: a three-pane main workspace while retaining the right-sidebar quick reader. The workspace/sorting implementation and DSH manifest wiring are in the repository. The UX reviewer identified non-collapsible collections, small text, and an active-filter visibility issue when collapsing an ancestor; all three were fixed and the final source-level UX follow-up confirmed the last fix. API and DSH integration reviewers reported no blockers. Final checks pass: 25/25 synthetic tests, all four syntax checks, bundle check, and `git diff --check`. The updated bundle was installed to DSH desktop profile 0.2.2-rc.3; install returned `application=applied` and the plugin row is enabled/active. The package manager printed a peer-dependency resolution warning for the linked package. DSH documentation requires a restart to load a fresh JavaScript module generation after replacing an installed package; user restart and authenticated GUI verification are pending. The Codex silent-assumption sweep was attempted but unavailable before reading artifacts; no clean cross-model verdict is claimed. Earlier screenshots confirm the prior sidebar/PDF view, not the new main workspace. The user reports a separate unreadable-database error with the real-library setting. Root cause and real-library path/schema compatibility remain unresolved; automated tests use synthetic data only and the agent has not queried the real database.

## F0–F4 ladder

- F0 Host `/health` + DSH right-sidebar tab — implemented; HTTP test (3/3), syntax and bundle checks pass. Bundle is active; a user screenshot confirms the tab renders, while live slot registration was not directly inspected by the agent.
- F1 read-only SQLite + collections tree — implemented; synthetic DB/HTTP suite 8/8 passes; the actual user library was not queried.
- F2 item search/detail — implemented; 16/16 synthetic DB/HTTP tests pass. The user reports live search/detail succeeded, but current real-library setting returns an unreadable-database state; the source of the earlier screenshot is unconfirmed and the real DB has not been inspected by the agent.
- F3 safe local PDF route + reader — implemented; 6/6 focused tests and 22/22 cumulative tests pass. A user screenshot confirms an embedded PDF view/page counter renders, and the user reports opening the PDF; the screenshot's data source is not confirmed, so real-library attachment compatibility remains unresolved.
- F4 resilience, accessibility, packaging, and team reviews — implementation complete; 23/23 synthetic tests, syntax checks, bundle checks, and diff check pass. The synthetic fixture health/search smoke check returns `ready`/one result. Codex silent-assumption sweep is `SWEEP_UNAVAILABLE` (host missing; artifacts not read; no clean verdict). Profile installation is applied and active. UI and embedded PDF rendering are screenshot-confirmed, but the latest real-library setting produces a generic read error; root cause remains open.

## UI alignment extension — 2026-11-15

- Approved choice: full-width three-pane workspace plus the existing compact right-sidebar reader. Client registers a root `main` keyed panel and matching `sidebar.panellist` entry; package manifest injects DSH `ui-layout` and `ui-sidebar` packages.
- Implemented collection collapse/expand with `parentKey`/`depth`, localized accessible disclosure controls, 12px primary list/collection text, server-side sort whitelist (`dateAdded`, `title`, `date`, `author`) and stable pagination ordering.
- Team review: API/safety review found no actionable issues; DSH slot review found no integration blockers. UX review findings (collapsible tree, text legibility, active-filter visibility when collapsing an ancestor) have been addressed; final source-level UX follow-up confirmed the last fix.
- Final source checks: `node --test tests/*.test.js` → 25/25; all four syntax checks pass; `node scripts/check-bundle.mjs` and `git diff --check` pass. `plugin_manager install_bundle` returned `application=applied`; plugin row is enabled/active. The linked-package peer-dependency warning was reported; DSH restart and user GUI validation remain pending.
- No authenticated browser control is available to the agent. The existing profile still has the earlier sidebar-only bundle; do not claim the new main workspace is visually verified.

## Reuse survey evidence

- Current profile `dsh-plugin-zotero` 0.8.1 already provides a right-sidebar PDF.js reader, but its README says the local Zotero desktop must be running; Host routes use the Zotero loopback API.
- Workspace `zotero_offline_mcp/zotero_server.py` already contains read-only SQLite query logic and uses `mode=ro`, `query_only`, and non-immutable reads so WAL changes remain visible. It is a stdio MCP server and cannot itself render the DSH sidebar.
- Current DSH bundled Node is 24.21.0 and `node:sqlite` exposes `DatabaseSync`, so a separate Host plugin can query SQLite without a new native dependency.
- DSH installed docs expose `webServer.register`, `sidebarRightTabs.register`, and `sidebar.right.pane.tab` slot usage from the installed Zotero plugin.

## Remote and deployment boundary

- `origin` is `https://github.com/careandmiss/zotero-local-reader.git`; the user explicitly authorized normal pushes on 2026-11-15. Push only tested commits to `main`; no force-push.
- Git push authorization alone did not authorize profile changes; the user separately authorized local DSH installation in goal round 1. The updated three-pane bundle is installed and active. DSH restart is required to load a fresh Client module generation; do not claim the new UI is live until user validation.

## Verification boundary

Agent-run tests use synthetic temporary fixtures only; the agent did not query the real database. User screenshots show the reader panel and embedded PDF viewer, while the latest screenshot shows the generic unreadable-database state for the user's current library setting. The user reports prior search/detail/PDF success; exact source of that earlier view is unconfirmed. The agent did not have authenticated browser control and did not inspect document text. The unauthenticated direct API probe received HTTP 401. Real-library path/schema compatibility remains unresolved.
