# Build note

## Current stage

Plan/Design approved by the user on 2026-11-15. F0–F4 implementation, team reviews, synthetic tests, syntax checks, and bundle checks are complete. The Codex silent-assumption sweep was attempted but unavailable before reading artifacts; no clean cross-model verdict is claimed. The user separately authorized profile installation; `plugin_manager install_bundle` applied the repository bundle to DSH desktop profile (0.2.2-rc.3), and the row is enabled/active. pnpm printed a peer-dependency resolution warning for the local link, although the manager applied the bundle and the Host row is active. The reader UI was not opened; an unauthenticated local API probe returned 401, so live UI, real-library, and native-PDF behavior remain unverified. Verification commands did not query or log real Zotero content.

## F0–F4 ladder

- F0 Host `/health` + DSH right-sidebar tab — implemented; HTTP test (3/3), syntax and bundle checks pass. Bundle is active in the DSH profile; rendered tab remains unverified.
- F1 read-only SQLite + collections tree — implemented; synthetic DB/HTTP suite 8/8 passes; the actual user library was not queried.
- F2 item search/detail — implemented; 16/16 synthetic DB/HTTP tests pass; authenticated live search/detail remain unverified.
- F3 safe local PDF route + reader — implemented; 6/6 focused tests and 22/22 cumulative tests pass; native viewer rendering remains unverified despite profile installation.
- F4 resilience, accessibility, packaging, and team reviews — implementation complete; 23/23 synthetic tests, syntax checks, bundle checks, and diff check pass. Codex silent-assumption sweep is `SWEEP_UNAVAILABLE` (host missing; artifacts not read; no clean verdict). Profile installation is applied and active; unauthenticated API access returned 401, and UI/PDF rendering remains unverified.

## Reuse survey evidence

- Current profile `dsh-plugin-zotero` 0.8.1 already provides a right-sidebar PDF.js reader, but its README says the local Zotero desktop must be running; Host routes use the Zotero loopback API.
- Workspace `zotero_offline_mcp/zotero_server.py` already contains read-only SQLite query logic and uses `mode=ro`, `query_only`, and non-immutable reads so WAL changes remain visible. It is a stdio MCP server and cannot itself render the DSH sidebar.
- Current DSH bundled Node is 24.21.0 and `node:sqlite` exposes `DatabaseSync`, so a separate Host plugin can query SQLite without a new native dependency.
- DSH installed docs expose `webServer.register`, `sidebarRightTabs.register`, and `sidebar.right.pane.tab` slot usage from the installed Zotero plugin.

## Remote and deployment boundary

- `origin` is `https://github.com/careandmiss/zotero-local-reader.git`; the user explicitly authorized normal pushes on 2026-11-15. Push only tested commits to `main`; no force-push.
- Git push authorization alone did not authorize profile changes; the user separately authorized local DSH installation in goal round 1. The final repository bundle is now installed and active in the desktop profile.

## Verification boundary

No real Zotero record or PDF was opened. Tests use synthetic temporary fixtures. The final GUI bundle is installed/active, but no authenticated browser control was available; the reader tab was not opened and live layout/PDF rendering remain unverified. An unauthenticated direct API probe received HTTP 401.
