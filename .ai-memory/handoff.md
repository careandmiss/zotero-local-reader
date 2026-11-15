# Handoff checkpoint — DSH Zotero local reader

## Completed with evidence

- User separately authorized local DSH installation in goal round 1. `plugin_manager install_bundle` applied the repository bundle to the active `desktop` profile on DSH 0.2.2-rc.3; `list_plugins` showed `zotero-local-reader` enabled and `fiberPhase=active`. pnpm printed a peer-dependency resolution warning for the local link, while the manager still applied the bundle.
- A temporary Host-only test bundle configured for a synthetic fixture was installed and removed. Its fixture and bundle directories were cleaned.
- A synthetic UI fixture remains in OS Temp with two synthetic titles and two PDF fixtures; read-only validation confirmed 4 item rows, PDF headers, and xref offsets. The actual plugin handler returned 200 for health/search/detail/PDF; a fresh synthetic DB check reports health `ready` and one search hit, and all 23 tests pass. The user previously reported UI/search/detail/PDF success, but the current screenshot shows an unreadable-database state for the user's configured real-library setting. No real path or database contents were provided to the agent. Keep the fixture until the user completes the synthetic UI comparison.
- The direct unauthenticated request to `/dsh-zotero-local/api/health` returned HTTP 401. No attempt was made to bypass DSH authentication or obtain browser credentials.
- User-provided screenshots were inspected only for interface state: the reader panel, local-library indicator, metadata sections, embedded PDF viewer/page counter, and a later unreadable-database state are visible. Document text was not transcribed, quoted, logged, or committed. No local path or database content was shared.
- Earlier three-pane UI-A/UI-Z work was superseded after the user rejected the narrow inspector reading surface. User supplied the target two-pane library and the rejected sidebar PDF screenshots, and approved the correction: main library = collection/tag navigator + item list; full read = full-width main-panel reader; right sidebar = metadata quick preview routing full reading to main. Read-only inspection of installed `dsh-plugin-zotero@0.8.1` confirmed its collection/tag + list structure. Plan/spec amendment `001908f` was pushed before implementation. Current source adds the read-only tag endpoint/filter and revised client flow. `node --test tests/*.test.js` passes 27/27; all four syntax checks, bundle check, and diff check pass. Source UX and tag API reviews found no blockers. The new bundle has not been installed to DSH or visually verified. Do not claim GUI acceptance until the user restarts the existing DSH GUI (current URL: `http://127.0.0.1:8565`) and checks the flow.

## Relevant files

- `BUILD_NOTE.md`
- `implement-stage/BUILD_NOTE.md`
- `README.md`
- `plan.md`
- `docs/UI_DIRECTION.md`
- `implement-stage/ASSUMPTIONS.md`

## Unfinished

- The screenshot-approved bundle still needs final syntax/bundle/diff checks, then an authorized local profile update and user restart/GUI acceptance. Verify the two-pane view, tag filtering, right-sidebar metadata preview → full-width reader → return flow using only a synthetic fixture; do not start a replacement server or claim live rendering without evidence.
- Root cause of the latest unreadable-database state is unresolved. The user reports `dataDir` points to the real Zotero data directory; exact path was not requested or recorded. Agent verified only synthetic fixtures; no real database or paper content was opened. If real-library debugging resumes, isolate only with a synthetic fixture and ask only for the Zotero version if needed. Do not request/share paths or database/paper contents.
- Zotero 10 is an active release line; official release notes list 10.0.9 on 2026-11-10, but the user's exact 10.x version and schema compatibility remain unverified. [Zotero version history](https://www.zotero.org/support/changelog)
- Codex silent-assumption sweep is `SWEEP_UNAVAILABLE`; no clean cross-model verdict.

## Next action

Complete the remaining source checks, review the final diff, then update the existing DSH profile only under the already granted install authorization. Ask the user to restart the current GUI (`http://127.0.0.1:8565`) and verify the screenshot-approved two-pane library, tag filter, full-width reader, return-state retention, and sidebar-to-main route. Do not claim visual success without user evidence. Keep the real-library unreadable error separate; never access the real database or paper content.
