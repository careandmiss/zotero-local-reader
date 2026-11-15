# Build Note — DSH Zotero local reader

| Rung | Feature | Acceptance check (one command) | Tier | Status |
|------|---------|--------------------------------|------|--------|
| F0 | DSH bundle/Host health route/Client right-sidebar tab skeleton | `node --test tests/http.test.js` | MUST | ✅ passed |
| F1 | Read-only SQLite connection, schema/health, collection tree and counts | `node --test tests/zotero-db.test.js tests/http.test.js` | MUST | ✅ passed |
| F2 | Item list, detail metadata, search, pagination, and current-snapshot reads | `node --test tests/library.test.js tests/http.test.js tests/zotero-db.test.js` | MUST | ✅ passed |
| F3 | Key-resolved local PDF route, path containment, Range responses, reader UI | `node --test tests/http-files.test.js` | MUST | ✅ passed |
| F4 | Packaging/metadata/docs, review fixes, cumulative verification, local DSH install | `node scripts/check-bundle.mjs` | MUST | checks passed for the original sidebar release; installed/active; live UI/API behavior partially unverified; cross-model sweep unavailable |
| UI-A | Approved three-pane main workspace, collapsible collections, server sorting; retain quick reader | `node --test tests/*.test.js` | MUST | source checks pass 25/25; installed/active; visual validation pending |
| UI-Z | Superseded first library-style attempt: three-pane native table + Info/PDF inspector | `node --test tests/*.test.js` | MUST | historical only; user rejected its narrow inspector reading layout |
| UI-R | Screenshot-approved two-pane library, functional tags, full-width main-panel PDF reader, metadata-only sidebar preview | `node --test tests/*.test.js` | MUST | 27/27 synthetic tests, four syntax checks, bundle and diff pass; source reviews found no blockers; bundle applied/active; GUI validation pending |

## Run record

- Base commit before implementation: `d92349b2ff004cdf704337eddf19c0dfd69fc02b`.
- F0: `node --test tests/http.test.js` → exit 0 (3/3); syntax checks and bundle metadata check also exit 0; artifact: DSH package skeleton + local `/health` response; fix attempts: 0.
- F1: `node --test tests/zotero-db.test.js tests/http.test.js` → exit 0 (8/8); fixture verifies read-only SQLite, schema rejection, collection hierarchy/counts, and HTTP route; syntax/bundle checks also exit 0; fix attempts: 0.
- F2: `node --test tests/library.test.js tests/http.test.js tests/zotero-db.test.js` → exit 0 (16/16); synthetic fixtures cover list/detail/search/filter/pagination/fresh reads and HTTP endpoints; syntax/bundle checks also exit 0; fix attempts: 0.
- F3: `node --test tests/http-files.test.js` → exit 0 (6/6); all 22 cumulative tests, syntax checks, and bundle check pass; fixture verifies attachment-key binding, Range, traversal rejection, and realpath symlink containment; fix attempts: 1 (corrected test's expected 8-byte slice).
- F4: `node --test tests/*.test.js` → exit 0 (23/23); all four entry syntax checks → exit 0; `node scripts/check-bundle.mjs` → exit 0 (icon 695 bytes); `git diff --check` → exit 0. UX review fixes cover PDF/detail/list retry, pagination preservation, and accurate loading/error states; security review found no implementation defect and prompted Origin/Host negative tests; packaging review prompted transparent 36x36 icon and export/asset guards. Codex silent-assumption sweep call failed before artifact access (`codex-code-mode-host.exe` missing; Desktop access denied), so status is `SWEEP_UNAVAILABLE`, not clean. Final `plugin_manager install_bundle` targeted this repository, returned `application=applied`, and `list_plugins` showed `zotero-local-reader` enabled with `fiberPhase=active` in DSH desktop profile 0.2.2-rc.3. pnpm printed a peer-dependency resolution warning for the local link; the manager still applied it and the Host row is active. The synthetic fixture now returns health `ready` and one search hit through the current DB code. User screenshots show the reader panel and embedded PDF viewer; a later screenshot shows an unreadable-database state with the user's current library setting. The user reports prior search/detail/PDF success, but the earlier screenshot's source is unconfirmed. The agent did not inspect real database contents or the paper text; root cause of the current real-library error remains unresolved.

## UI-A run record — 2026-11-15

- User approved option A: a full-width three-pane workspace, retaining the existing right-sidebar quick reader. Added main keyed-panel + matching sidebar launcher registration and the DSH layout/sidebar Client injections; added whitelist-backed server sorting and collection `parentKey`/`depth` for collapsible navigation.
- Team review: API reviewer found no actionable sorting/security defects; DSH integration reviewer found no slot/service blockers. UX reviewer flagged tree collapse, small labels, and active-filter visibility; all findings were fixed, and the follow-up confirmed the last fix at source level.
- UI-A verification: `node --test tests/*.test.js` → 25/25; all four `node --check` commands, `node scripts/check-bundle.mjs`, and `git diff --check` pass. `plugin_manager install_bundle` returned `application=applied`, and the plugin row is enabled/active; a peer-dependency warning was printed for the local link. The user restarted before the later UI-Z source changes.
- UI-Z source review: native table semantics expose `aria-sort` on only the active safe sort column; PDF status has localized accessible text. UX re-review found no remaining source issue. Latest tests pass, but this Client style edit needs a fresh DSH process start and GUI review. Agent has no authenticated browser control; no live rendering claim is made. Real Zotero data remains untouched.

## UI-R run record — 2026-11-15

- User screenshots show a two-pane collection/tag library as the target and a narrow right-sidebar PDF view as the rejected reading surface. Read-only inspection of installed `dsh-plugin-zotero@0.8.1` confirmed the two-pane collection/tag + item-list architecture; its sidebar PDF reader is not used as the main reading route.
- User approved the replacement design. Plan/spec amendment commit `001908f` was pushed before code changes. Source now includes collection-scoped tag counts, safe exact tag filtering, a two-pane main library, a full-width main reader with PDF default, return-to-list state retention, and sidebar metadata quick preview with full-reader navigation.
- `node --test tests/*.test.js` → 27/27; all four `node --check` commands, `node scripts/check-bundle.mjs`, and `git diff --check` pass. Source UX and tag API reviews found no blockers; actual PDF sizing and sidebar → reader → return behavior remain for user GUI validation. The bundle update returned `application=applied`, and the plugin row is enabled/active; live rendering remains unverified.

## Deferred

- Web API integration, Zotero write operations, annotations/notes, linked-file access outside `storage/`, OCR, and telemetry are outside this build.

## Blockers

- None recorded.
