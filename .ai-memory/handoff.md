# Handoff checkpoint — DSH Zotero local reader

## Completed with evidence

- User separately authorized local DSH installation in goal round 1. `plugin_manager install_bundle` applied the repository bundle to the active `desktop` profile on DSH 0.2.2-rc.3; `list_plugins` showed `zotero-local-reader` enabled and `fiberPhase=active`. pnpm printed a peer-dependency resolution warning for the local link, while the manager still applied the bundle.
- A temporary Host-only test bundle configured for a synthetic fixture was installed and removed. Its fixture and bundle directories were cleaned.
- A separate synthetic UI fixture is now prepared in OS Temp. It contains two synthetic titles and two PDF fixtures; read-only validation confirmed 4 item records, 2 titles, PDF headers, and xref offsets. A smoke test against the plugin HTTP handler returned 200 for health, search, detail, and PDF. Exact local path is recorded only in ignored session memory; clean it after UI verification.
- The direct unauthenticated request to `/dsh-zotero-local/api/health` returned HTTP 401. No attempt was made to bypass DSH authentication or obtain browser credentials.
- Verification commands did not read, log, commit, or expose real Zotero records, PDFs, database files, storage paths, or credentials. The reader tab was not manually opened, and the active client pane's mount state could not be inspected.
- Repository tests and checks passed after documentation updates: 23/23 tests, four syntax checks, bundle check, and `git diff --check`.

## Relevant files

- `BUILD_NOTE.md`
- `implement-stage/BUILD_NOTE.md`
- `README.md`
- `plan.md`
- `docs/UI_DIRECTION.md`
- `implement-stage/ASSUMPTIONS.md`

## Unfinished

- Authenticated live UI verification: confirm the right-sidebar tab renders, and exercise search, detail, and PDF preview using the prepared synthetic library. The user must set the plugin's `dataDir` to the local fixture path recorded in ignored session memory before opening the reader. The current session has no connected authenticated browser control; do not launch a separate browser or inspect personal browser credentials.
- The actual user Zotero schema, real-library reads, and Chromium native PDF rendering remain unverified.
- Codex silent-assumption sweep is `SWEEP_UNAVAILABLE`; no clean cross-model verdict.

## Next action

Have the user set `dataDir` to the prepared synthetic fixture path in the existing authenticated DSH UI, then verify sidebar/search/detail/PDF there (or provide a redacted screenshot/result). Restore `dataDir` to blank and remove the fixture after the check. Keep the final repository bundle installed and active; do not alter or read the real Zotero library.
