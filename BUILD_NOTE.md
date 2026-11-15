# Build note

## Current stage

Plan/Design complete as draft. **No implementation code has been written.** Awaiting user approval of `spec.md` and `plan.md` before Build, per the project gate.

## F0–F4 ladder

- F0 Host `/health` + DSH right-sidebar tab — not started.
- F1 read-only SQLite + collections tree — not started.
- F2 live item search/detail — not started.
- F3 safe local PDF route + reader — not started.
- F4 resilience, accessibility, review, install verification — not started.

## Reuse survey evidence

- Current profile `dsh-plugin-zotero` 0.8.1 already provides a right-sidebar PDF.js reader, but its README says the local Zotero desktop must be running; Host routes use the Zotero loopback API.
- Workspace `zotero_offline_mcp/zotero_server.py` already contains read-only SQLite query logic and uses `mode=ro`, `query_only`, and non-immutable reads so WAL changes remain visible. It is a stdio MCP server and cannot itself render the DSH sidebar.
- Current DSH bundled Node is 24.21.0 and `node:sqlite` exposes `DatabaseSync`, so a separate Host plugin can query SQLite without a new native dependency.
- DSH installed docs expose `webServer.register`, `sidebarRightTabs.register`, and `sidebar.right.pane.tab` slot usage from the installed Zotero plugin.

## Verification boundary

No real Zotero record or PDF has been opened. Tests will use synthetic temporary fixtures. Current GUI installation/visual validation has not been attempted.
