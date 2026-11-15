# Build note

## Current stage

Plan/Design approved by the user on 2026-11-15. The user approved a full-width three-pane main workspace while retaining the right-sidebar quick reader, and later requested Zotero-library visual alignment. The latest Client source has a compact collection tree, native sortable table (`aria-sort` on active title/creator/date columns), and an item inspector with Info/PDF views; typography was raised for inspector legibility. The UI reviewer confirmed the table semantics and requested no remaining source fixes. All 25 synthetic tests, four syntax checks, bundle check, and `git diff --check` pass. The previously applied bundle remains active in DSH desktop profile 0.2.2-rc.3, but the current DSH process predates this source edit and must restart to load it. No authenticated GUI verification is available; no Zotero screenshot/version was supplied, so this is structural/density alignment, not pixel-level matching. The Codex silent-assumption sweep remains unavailable; no clean cross-model verdict is claimed. Earlier screenshots confirm only the prior sidebar/PDF view. The unreadable-database state for the real-library setting remains unresolved; tests use synthetic data only and the agent has not queried the real database.

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
- UI-A source checks: `node --test tests/*.test.js` → 25/25; all four syntax checks, bundle check, and diff check passed. `plugin_manager install_bundle` returned `application=applied`; the plugin row is enabled/active. The user restarted DSH before the later Zotero-style refinement; the current Client source edit needs a fresh process start before GUI review.
- No authenticated browser control is available to the agent. The three-pane view and the current style refinement are not visually verified; no exact Zotero screenshot/version was supplied.

## Zotero library style refinement — 2026-11-15

- User requested a closer match to Zotero’s library display. Assumption: align the familiar collections → item table → item inspector structure/density; preserve DSH theme tokens because no reference screenshot/version is available, so this is not pixel-level reproduction.
- Main view uses a native HTML table with Title/Creator/Date sort buttons and `aria-sort` only on the active sortable header; fields call only existing safe server sort keys. Type/PDF remain non-sortable.
- The inspector has real Info/PDF views using existing metadata, attachment state, and same-origin reader route. No Notes, Related, edit/import/sync controls were added. Right-sidebar quick reader remains separate.
- UX re-review closed the table semantics, inspector legibility, active-sort announcements, and PDF status accessible-name findings at source level. The PDF marker is hidden from assistive technology while localized status text remains available.
- Latest checks: 25/25 synthetic tests, four syntax checks, bundle check, and `git diff --check` pass. Actual appearance, theme contrast, and responsive fit still need the user’s authenticated GUI review after restart.

## Reuse survey evidence

- Current profile `dsh-plugin-zotero` 0.8.1 already provides a right-sidebar PDF.js reader, but its README says the local Zotero desktop must be running; Host routes use the Zotero loopback API.
- Workspace `zotero_offline_mcp/zotero_server.py` already contains read-only SQLite query logic and uses `mode=ro`, `query_only`, and non-immutable reads so WAL changes remain visible. It is a stdio MCP server and cannot itself render the DSH sidebar.
- Current DSH bundled Node is 24.21.0 and `node:sqlite` exposes `DatabaseSync`, so a separate Host plugin can query SQLite without a new native dependency.
- DSH installed docs expose `webServer.register`, `sidebarRightTabs.register`, and `sidebar.right.pane.tab` slot usage from the installed Zotero plugin.

## Remote and deployment boundary

- `origin` is `https://github.com/careandmiss/zotero-local-reader.git`; the user explicitly authorized normal pushes on 2026-11-15. Tested commit `1dd2632` was pushed to `main`; no force-push was used.
- Git push authorization alone did not authorize profile changes; the user separately authorized local DSH installation in goal round 1. The updated three-pane bundle is installed and active. DSH restart is required to load a fresh Client module generation; do not claim the new UI is live until user validation.

## Verification boundary

Agent-run tests use synthetic temporary fixtures only; the agent did not query the real database. User screenshots show the reader panel and embedded PDF viewer, while the latest screenshot shows the generic unreadable-database state for the user's current library setting. The user reports prior search/detail/PDF success; exact source of that earlier view is unconfirmed. The agent did not have authenticated browser control and did not inspect document text. The unauthenticated direct API probe received HTTP 401. Real-library path/schema compatibility remains unresolved.
