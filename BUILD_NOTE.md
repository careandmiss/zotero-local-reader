# Build note

## Current stage

The user has now approved a revised visual goal: use DSH's native document-preview PDF canvas like screenshots 2/3, not only the browser/iframe look of screenshot 1. The two-pane collection/tag + item-list library stays; due to the global `main` panel's lack of a mounted Session, the side/fullscreen PDF tab is still launched from the Session-bound metadata preview, with DSH native fullscreen on the same tab. Read-only source review identified the `ui-sidebar-documentpreview` PDF body and its public document-body slot. The earlier iframe side-tab implementation passed 27 synthetic tests, four syntax checks, bundle check, diff check and API/UX review, but was never committed or applied and is now superseded. The native renderer plan/spec amendment is approved but needs a design commit before implementation. No current source is deployed; visual behavior remains unverified. The Codex silent-assumption sweep remains unavailable; no clean cross-model verdict is claimed. The unreadable-database state for the real-library setting remains unresolved; all automated tests use synthetic data, and the agent has not queried the real database.

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

## Prior Zotero library refinement — superseded

- The first refinement incorrectly assumed a three-pane collection → item table → inspector layout and did not use the screenshots supplied afterward. The user explicitly rejected that layout because the inspector made paper reading inconvenient.
- That revision did include the native sortable table, active-only `aria-sort`, real Info/PDF content, accessible PDF status, and DSH theme tokens. Its 25-test/syntax/bundle evidence is historical only and does not describe the current screenshot-approved layout.
- The current approved design and verification state are recorded in the UX correction section below and in `plan.md`/`spec.md`.

## Screenshot-based UX correction — 2026-11-15

- Source review: installed `dsh-plugin-zotero@0.8.1` `ZoteroPane` uses collection/tag navigation plus item list; item opening is separate from the library list. The screenshot's narrow PDF is a sidebar reader, so it should not be the main reading route. This package was inspected read-only.
- User approved the two-pane main library + full-width main-panel reader + metadata-only sidebar quick preview. Plan/spec amendment was committed and pushed as `001908f` before source changes.
- Current source now has `GET /tags` with collection-scoped counts, parameterized exact-tag filtering on `/items`, a two-pane collection/tag navigator + list, full-width PDF reader with PDF default, and a sidebar-to-main reader transition. Returning to the list retains its local filter/sort/page state.
- Verification: `node --test tests/*.test.js` → 27/27; all four syntax checks, `node scripts/check-bundle.mjs`, and `git diff --check` pass. Source-only UX and tag API reviews found no blockers. Actual PDF sizing and sidebar → reader → return/filter-persistence checks remain for the user GUI. `plugin_manager.install_bundle` returned `application=applied` and the row is active, but the GUI rendering is unverified.

## Dual reading-mode amendment — 2026-11-15

- The user first clarified that papers need side reading and fullscreen. Plan/spec commits `abda206` and `450ec27` corrected the original assumption after review showed that root-scoped global panels have no mounted Session; the chosen native-rightbar route is launched from the Session-bound metadata preview.
- The earlier side-tab implementation used a browser PDF iframe and DSH's `push` / `fullscreen` control. API/UX reviews found no remaining blocker; 27 synthetic tests, four syntax checks, bundle validation, and diff check passed. The source was never committed or applied to the active profile.
- The user later clarified that the visual target is DSH's native document-preview style (screenshots 2/3), not only the browser/iframe look (screenshot 1). The earlier iframe implementation is superseded; no live browser/DOM inspection is available.
- No real Zotero paths, database, or PDF contents were read.

## Native DSH PDF canvas amendment — 2026-11-15

- User-approved target: side and fullscreen reading should use DSH's native document-preview PDF canvas from screenshots 2/3, not a plain `<iframe>` browser viewer. The overall project goal was revised accordingly.
- Source evidence: installed DSH 0.2.2-rc.3 `@deepseek-ai/dsh-client-ui-sidebar-documentpreview` registers its built-in PDF body under `sidebar.right.tab.document`, consumes `DocumentContent { kind: 'bytes' }`, and renders a themed PDF.js canvas with fit-width, zoom gestures, selectable text, and page shadows. Its parent document preview uses a declared keyed child slot; the plugin can pass verified Zotero API bytes to the renderer without exposing the storage path.
- Current plan: replace only the Session-bound rightbar resource tab's iframe with the native PDF body slot; preserve the key-based GET API and DSH fullscreen on the same resource tab. Keep the root-scoped main-panel reader as a fallback because it has no Session. Bound full-byte loads at 32 MiB (matching DSH workspace-file default); above the cap, offer a clear “read in main workspace” alternative.
- The updated spec and plan are approved and awaiting a design commit. Implementation, regression tests, API/UX review, deployment, and live GUI acceptance remain pending. No real Zotero data or PDF was accessed.

## Reuse survey evidence

- Current profile `dsh-plugin-zotero` 0.8.1 already provides a right-sidebar PDF.js reader, but its README says the local Zotero desktop must be running; Host routes use the Zotero loopback API.
- Workspace `zotero_offline_mcp/zotero_server.py` already contains read-only SQLite query logic and uses `mode=ro`, `query_only`, and non-immutable reads so WAL changes remain visible. It is a stdio MCP server and cannot itself render the DSH sidebar.
- Current DSH bundled Node is 24.21.0 and `node:sqlite` exposes `DatabaseSync`, so a separate Host plugin can query SQLite without a new native dependency.
- DSH installed docs expose `webServer.register`, `sidebarRightTabs.register`, and `sidebar.right.pane.tab` slot usage from the installed Zotero plugin.

## Remote and deployment boundary

- `origin` is `https://github.com/careandmiss/zotero-local-reader.git`; the user explicitly authorized normal pushes on 2026-11-15. Tested commit `1dd2632` was pushed to `main`; no force-push was used.
- Git push authorization alone did not authorize profile changes; the user separately authorized local DSH installation in goal round 1 and confirmed remove/reinstall of the existing local bundle for this update. `plugin_manager.remove_bundle` and `install_bundle` both returned `application=applied`; `list_plugins` shows `include:zotero-local-reader` enabled/active. No authenticated GUI rendering has been verified; ask the user to refresh/restart the existing DSH page and validate. The install reported existing peer-dependency warnings and an unrelated `mcp-minimax-search` startup warning.

## Verification boundary

Agent-run tests use synthetic temporary fixtures only; the agent did not query the real database. User screenshots show the reader panel and embedded PDF viewer, while the latest screenshot shows the generic unreadable-database state for the user's current library setting. The user reports prior search/detail/PDF success; exact source of that earlier view is unconfirmed. The agent did not have authenticated browser control and did not inspect document text. The unauthenticated direct API probe received HTTP 401. Real-library path/schema compatibility remains unresolved.
