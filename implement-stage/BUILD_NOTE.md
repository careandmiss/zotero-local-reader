# Build Note — DSH Zotero local reader

| Rung | Feature | Acceptance check (one command) | Tier | Status |
|------|---------|--------------------------------|------|--------|
| F0 | DSH bundle/Host health route/Client right-sidebar tab skeleton | `node --test tests/http.test.js` | MUST | ✅ passed |
| F1 | Read-only SQLite connection, schema/health, collection tree and counts | `node --test tests/zotero-db.test.js tests/http.test.js` | MUST | ✅ passed |
| F2 | Item list, detail metadata, search, pagination, and current-snapshot reads | `node --test tests/library.test.js tests/http.test.js tests/zotero-db.test.js` | MUST | ✅ passed |
| F3 | Key-resolved local PDF route, path containment, Range responses, reader UI | `node --test tests/http-files.test.js` | MUST | pending |
| F4 | Packaging/metadata/docs plus cumulative verification | `node scripts/check-bundle.mjs` | MUST | pending |

## Run record

- Base commit before implementation: `d92349b2ff004cdf704337eddf19c0dfd69fc02b`.
- F0: `node --test tests/http.test.js` → exit 0 (3/3); syntax checks and bundle metadata check also exit 0; artifact: DSH package skeleton + local `/health` response; fix attempts: 0.
- F1: `node --test tests/zotero-db.test.js tests/http.test.js` → exit 0 (8/8); fixture verifies read-only SQLite, schema rejection, collection hierarchy/counts, and HTTP route; syntax/bundle checks also exit 0; fix attempts: 0.
- F2: `node --test tests/library.test.js tests/http.test.js tests/zotero-db.test.js` → exit 0 (16/16); synthetic fixtures cover list/detail/search/filter/pagination/fresh reads and HTTP endpoints; syntax/bundle checks also exit 0; fix attempts: 0.

## Deferred

- Web API integration, Zotero write operations, annotations/notes, linked-file access outside `storage/`, OCR, and telemetry are outside this build.

## Blockers

- None recorded.
