# Handoff checkpoint — DSH Zotero local reader

## Completed with evidence

- User separately authorized local DSH installation in goal round 1. `plugin_manager install_bundle` applied the repository bundle to the active `desktop` profile on DSH 0.2.2-rc.3; `list_plugins` showed `zotero-local-reader` enabled and `fiberPhase=active`. pnpm printed a peer-dependency resolution warning for the local link, while the manager still applied the bundle.
- A temporary Host-only test bundle configured for a synthetic fixture was installed and removed. Its fixture and bundle directories were cleaned.
- A synthetic UI fixture remains in OS Temp with two synthetic titles and two PDF fixtures; read-only validation confirmed 4 item rows, PDF headers, and xref offsets. The actual plugin handler returned 200 for health/search/detail/PDF; a fresh synthetic DB check reports health `ready` and one search hit, and all 23 tests pass. The user previously reported UI/search/detail/PDF success, but the current screenshot shows an unreadable-database state for the user's configured real-library setting. No real path or database contents were provided to the agent. Keep the fixture until the user completes the synthetic UI comparison.
- The direct unauthenticated request to `/dsh-zotero-local/api/health` returned HTTP 401. No attempt was made to bypass DSH authentication or obtain browser credentials.
- User-provided screenshots were inspected only for interface state: the reader panel, local-library indicator, metadata sections, embedded PDF viewer/page counter, and a later unreadable-database state are visible. Document text was not transcribed, quoted, logged, or committed. No local path or database content was shared.
- Earlier three-pane UI-A/UI-Z work was rejected. The approved two-pane library remains. A technical review found the global `main` panel has no mounted Session; the user accepted launching side PDF tabs from the Session-bound metadata preview. After seeing screenshots 1–3, the user explicitly revised the visual goal to DSH's native document-preview PDF canvas (screenshots 2/3), not only the iframe/browser style (screenshot 1), and approved using the native PDF body slot for side/fullscreen. DSH `ui-sidebar-documentpreview` source was inspected read-only. The earlier iframe resource-tab implementation passed 27 synthetic tests and source reviews but was never committed or applied; it is now superseded. New native-renderer spec/plan edits are pending their design commit, and implementation/tests/review remain unfinished. Current profile still has the previous bundle; GUI appearance/fullscreen remains unverified.

## Relevant files

- `BUILD_NOTE.md`
- `implement-stage/BUILD_NOTE.md`
- `README.md`
- `plan.md`
- `docs/UI_DIRECTION.md`
- `implement-stage/ASSUMPTIONS.md`

## Unfinished

- For the superseded iframe revision, 27 synthetic tests and all required syntax/bundle/diff checks passed, and technical/UX reviews found no remaining blocker. The user then approved the native DSH PDF-canvas design; it is not implemented or verified yet. Do not commit/deploy the stale iframe version. After the native renderer is built and tested, deploy only within the existing authorization; user refresh/restart and visual acceptance should verify main row → immersive fallback → return, plus active Session metadata preview → native side PDF → DSH fullscreen on that same tab. Do not start a replacement server or claim live rendering without evidence.
- Root cause of the latest unreadable-database state is unresolved. The user reports `dataDir` points to the real Zotero data directory; exact path was not requested or recorded. Agent verified only synthetic fixtures; no real database or paper content was opened. If real-library debugging resumes, isolate only with a synthetic fixture and ask only for the Zotero version if needed. Do not request/share paths or database/paper contents.
- Zotero 10 is an active release line; official release notes list 10.0.9 on 2026-11-10, but the user's exact 10.x version and schema compatibility remain unverified. [Zotero version history](https://www.zotero.org/support/changelog)
- Codex silent-assumption sweep is `SWEEP_UNAVAILABLE`; no clean cross-model verdict.

## Next action

First commit the approved native-renderer spec/plan amendment, then implement and validate the DSH document-preview PDF body using bytes from the same-origin key-based API (no actual Zotero path). Do not deploy the superseded iframe source. After implementation passes tests/reviews and is deployed under existing authorization, ask the user to refresh/restart the current GUI (`http://127.0.0.1:8565`) and verify the side PDF style 2/3, host fullscreen on the same tab, and main-reader fallback. If the real database is not detected, keep that issue separate and do not access real database or PDF contents.
