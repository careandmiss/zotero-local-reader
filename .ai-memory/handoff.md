# Handoff checkpoint — DSH Zotero local reader

## Completed with evidence

- User separately authorized local DSH installation in goal round 1. `plugin_manager install_bundle` applied the repository bundle to the active `desktop` profile on DSH 0.2.2-rc.3; `list_plugins` showed `zotero-local-reader` enabled and `fiberPhase=active`. pnpm printed a peer-dependency resolution warning for the local link, while the manager still applied the bundle.
- A temporary Host-only test bundle configured for a synthetic fixture was installed and removed. Its fixture and bundle directories were cleaned.
- A synthetic UI fixture remains in OS Temp with two synthetic titles and two PDF fixtures; read-only validation confirmed 4 item rows, PDF headers, and xref offsets. The actual plugin handler returned 200 for health/search/detail/PDF; a fresh synthetic DB check reports health `ready` and one search hit, and all 23 tests pass. The user previously reported UI/search/detail/PDF success, but the current screenshot shows an unreadable-database state for the user's configured real-library setting. No real path or database contents were provided to the agent. Keep the fixture until the user completes the synthetic UI comparison.
- The direct unauthenticated request to `/dsh-zotero-local/api/health` returned HTTP 401. No attempt was made to bypass DSH authentication or obtain browser credentials.
- User-provided screenshots were inspected only for interface state: the reader panel, local-library indicator, metadata sections, embedded PDF viewer/page counter, and a later unreadable-database state are visible. Document text was not transcribed, quoted, logged, or committed. No local path or database content was shared.
- Original sidebar release passed 23/23 synthetic tests, four syntax checks, bundle check, and `git diff --check`. The user approved UI option A (three-pane main workspace + retained right-sidebar quick reader). Current source adds main/sidebar slot registrations, DSH layout/sidebar injections, safe server-side sort, and collapsible collection hierarchy. Team API and DSH reviewers found no blockers; UX findings on collapse, typography, and selected-filter visibility were fixed and follow-up confirmed. Final checks pass: 25/25 synthetic tests, four syntax checks, bundle check, and `git diff --check`. Updated bundle installation returned `application=applied`; plugin row is enabled/active. A peer-dependency resolution warning was printed for the local link. Restart and user GUI validation remain pending.

## Relevant files

- `BUILD_NOTE.md`
- `implement-stage/BUILD_NOTE.md`
- `README.md`
- `plan.md`
- `docs/UI_DIRECTION.md`
- `implement-stage/ASSUMPTIONS.md`

## Unfinished

- Root cause of the latest unreadable-database state is unresolved. The user reports `dataDir` currently points to the real Zotero data directory; exact path was not requested or recorded. Agent verified only synthetic fixtures; no real database or paper content was opened. After the updated bundle is installed, isolate with the synthetic fixture in the DSH UI; if it connects, ask only for the exact Zotero version from Help > About. Do not request/share paths or database/paper contents.
- Zotero 10 is an active release line; official release notes list 10.0.9 on 2026-11-10, but the user's exact 10.x version and schema compatibility remain unverified. [Zotero version history](https://www.zotero.org/support/changelog)
- Codex silent-assumption sweep is `SWEEP_UNAVAILABLE`; no clean cross-model verdict.

## Next action

Ask the user to restart DSH so the replaced package loads a fresh Client module generation. Then ask them to temporarily select the known synthetic fixture in plugin settings, click **重新检查**, and report only whether it connects plus the exact Zotero version from Help > About. Then have them restore their original setting; do not ask for the real path or an unredacted screenshot. Keep the fixture until the user confirms it is no longer configured; never access the real database.
