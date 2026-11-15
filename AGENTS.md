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

## DSH UI diagnostics

- A `plugin_manager` row marked enabled/active proves the Host bundle state, not that the browser Client factory ran or registered its slots. For a missing panel, check the live Client module graph/loader diagnostics or inspect the user's visible sidebar before concluding the entry point is present.
- A registered `sidebar.panellist` entry normally appears in the sidebar. DSH's “More” menu is conditional on `sidebar.panellist.actions`; only manually unpinned entries are moved there. Do not tell users that every plugin entry is under “More” by default.
- If a bundle is enabled but its Client panel is missing, guide the user to the sidebar-bottom **Settings > Built-in plugins > Plugin list** (`设置 > 内置插件 > 插件列表`): DSH exposes page-local Client synchronization failures and retry there. Do not toggle or reinstall the Host bundle based only on a missing Client launcher.

## Security

Use parameterized SQL, `readOnly` SQLite connections plus `query_only`, GET-only local routes, no CORS, loopback/source checks, key-based attachment lookup, realpath containment under Zotero `storage`, and bounded pagination. Never accept arbitrary filesystem paths from the Client.
