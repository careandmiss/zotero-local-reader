# Build Note — DSH Zotero local reader

| Rung | Feature | Acceptance check (one command) | Tier | Status |
|------|---------|--------------------------------|------|--------|
| F0 | DSH bundle/Host health route/Client right-sidebar tab skeleton | `node --test tests/http.test.js` | MUST | ✅ passed |
| F1 | Read-only SQLite connection, schema/health, collection tree and counts | `node --test tests/zotero-db.test.js tests/http.test.js` | MUST | ✅ passed |
| F2 | Item list, detail metadata, search, pagination, and current-snapshot reads | `node --test tests/library.test.js tests/http.test.js tests/zotero-db.test.js` | MUST | ✅ passed |
| F3 | Key-resolved local PDF route, path containment, Range responses, reader UI | `node --test tests/http-files.test.js` | MUST | ✅ passed |
| F4 | Packaging/metadata/docs, review fixes, cumulative verification, local DSH install | `node scripts/check-bundle.mjs` | MUST | checks passed; installed/active; live UI/API behavior partially unverified; cross-model sweep unavailable |

## Run record

- Base commit before implementation: `d92349b2ff004cdf704337eddf19c0dfd69fc02b`.
- F0: `node --test tests/http.test.js` → exit 0 (3/3); syntax checks and bundle metadata check also exit 0; artifact: DSH package skeleton + local `/health` response; fix attempts: 0.
- F1: `node --test tests/zotero-db.test.js tests/http.test.js` → exit 0 (8/8); fixture verifies read-only SQLite, schema rejection, collection hierarchy/counts, and HTTP route; syntax/bundle checks also exit 0; fix attempts: 0.
- F2: `node --test tests/library.test.js tests/http.test.js tests/zotero-db.test.js` → exit 0 (16/16); synthetic fixtures cover list/detail/search/filter/pagination/fresh reads and HTTP endpoints; syntax/bundle checks also exit 0; fix attempts: 0.
- F3: `node --test tests/http-files.test.js` → exit 0 (6/6); all 22 cumulative tests, syntax checks, and bundle check pass; fixture verifies attachment-key binding, Range, traversal rejection, and realpath symlink containment; fix attempts: 1 (corrected test's expected 8-byte slice).
- F4: `node --test tests/*.test.js` → exit 0 (23/23); all four entry syntax checks → exit 0; `node scripts/check-bundle.mjs` → exit 0 (icon 695 bytes); `git diff --check` → exit 0. UX review fixes cover PDF/detail/list retry, pagination preservation, and accurate loading/error states; security review found no implementation defect and prompted Origin/Host negative tests; packaging review prompted transparent 36x36 icon and export/asset guards. Codex silent-assumption sweep call failed before artifact access (`codex-code-mode-host.exe` missing; Desktop access denied), so status is `SWEEP_UNAVAILABLE`, not clean. Final `plugin_manager install_bundle` targeted this repository, returned `application=applied`, and `list_plugins` showed `zotero-local-reader` enabled with `fiberPhase=active` in DSH desktop profile 0.2.2-rc.3. pnpm printed a peer-dependency resolution warning for the local link; the manager still applied it and the Host row is active. A temporary Host-only bundle using a synthetic fixture was installed and removed; the direct unauthenticated `/dsh-zotero-local/api/health` probe returned HTTP 401, so it did not validate the endpoint response. The reader tab was not manually opened and no authenticated request to the real library was issued by verification; the active client pane's mount state could not be inspected. UI rendering, live library search/detail, and Chromium PDF rendering remain unverified.

## Deferred

- Web API integration, Zotero write operations, annotations/notes, linked-file access outside `storage/`, OCR, and telemetry are outside this build.

## Blockers

- None recorded.
