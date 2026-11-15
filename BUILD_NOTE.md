# Build note

## Current stage

Plan/Design approved by the user on 2026-11-15. F0–F3 are implemented and tested; F4 packaging, review, and release checks are next. Profile installation remains a separate deployment step.

## F0–F4 ladder

- F0 Host `/health` + DSH right-sidebar tab — implemented; HTTP test (3/3), syntax and bundle checks pass. Runtime visual verification is pending installation.
- F1 read-only SQLite + collections tree — implemented; synthetic DB/HTTP suite 8/8 passes; live profile verification pending.
- F2 live item search/detail — implemented; 16/16 synthetic DB/HTTP tests pass; live profile verification pending.
- F3 safe local PDF route + reader — implemented; 6/6 focused tests and 22/22 cumulative tests pass; native viewer rendering remains unverified without profile installation.
- F4 resilience, accessibility, review, install verification — not started.

## Reuse survey evidence

- Current profile `dsh-plugin-zotero` 0.8.1 already provides a right-sidebar PDF.js reader, but its README says the local Zotero desktop must be running; Host routes use the Zotero loopback API.
- Workspace `zotero_offline_mcp/zotero_server.py` already contains read-only SQLite query logic and uses `mode=ro`, `query_only`, and non-immutable reads so WAL changes remain visible. It is a stdio MCP server and cannot itself render the DSH sidebar.
- Current DSH bundled Node is 24.21.0 and `node:sqlite` exposes `DatabaseSync`, so a separate Host plugin can query SQLite without a new native dependency.
- DSH installed docs expose `webServer.register`, `sidebarRightTabs.register`, and `sidebar.right.pane.tab` slot usage from the installed Zotero plugin.

## Remote and deployment boundary

- `origin` is `https://github.com/careandmiss/zotero-local-reader.git`; the user explicitly authorized normal pushes on 2026-11-15. Push only tested commits to `main`; no force-push.
- Profile installation remains separate and is not authorized by the Git push instruction.

## Verification boundary

No real Zotero record or PDF has been opened. Tests use synthetic temporary fixtures. Current GUI installation/visual validation has not been attempted.
