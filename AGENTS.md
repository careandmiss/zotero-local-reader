# AGENTS.md — repository memory

## Commands

- Build/check bundle: `node scripts/check-bundle.mjs`
- Test: `node --test tests/*.test.js`
- Syntax: run `node --check` for `index.js`, `client.js`, `src/zotero-db.js`, and `src/http.js` sequentially; in Windows PowerShell 5, stop after each nonzero `$LASTEXITCODE` because `&&` is unsupported.
- Do not install dependencies unless the plan is amended and the user approves the dependency/build-script risk.

## Verification

Run bundle check, all tests, and syntax checks before reporting work complete. Keep tests synthetic; never log or commit real Zotero titles, abstracts, database files, storage directories, PDFs, or user credentials.

## Architecture

The DSH Host plugin reads Zotero SQLite read-only and streams only Zotero-managed PDF attachments through a same-origin route. The DSH Client registers a full-width main workspace via the keyed `main` slot and matching `sidebar.panellist` entry. The main library is a two-pane collection/tag navigator plus item list; opening a row enters the immersive main-panel fallback reader. The compact metadata-preview tab is session-bound and offers a key-addressed PDF resource tab rendered through DSH's native `ui-sidebar-documentpreview` PDF body slot plus a full main-panel read; the rightbar's native fullscreen presentation expands the same native reader tab. Feed the viewer only bytes from the same-origin API, never a Zotero storage path. Never call `sidebarRight.openResource()` from the root-scoped global `main` panel, because no Session is mounted there. Never call Zotero Desktop's localhost API or a cloud API.

## Security

Use parameterized SQL, `readOnly` SQLite connections plus `query_only`, GET-only local routes, no CORS, loopback/source checks, key-based attachment lookup, realpath containment under Zotero `storage`, and bounded pagination. Never accept arbitrary filesystem paths from the Client.
