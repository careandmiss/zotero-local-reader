# Assumption Ledger — DSH Zotero local reader
<!-- ASK mode: never -->

| ID | Under-determined by the request | Chosen | Class | Source |
|----|--------------------------------|--------|-------|--------|
| A-001 | “Read local Zotero in real time” does not define the data/API boundary | Direct read-only SQLite + local storage; no Zotero Web API or cloud service | semantic | user |
| A-002 | “Plugin” does not define whether an MCP tool alone is enough | DSH Host + Client plugin with a visible right-sidebar panel; existing offline MCP remains separate | interface | user |
| A-003 | Request does not state whether the plugin may modify the library | Read-only DB connection, `query_only`, GET-only routes; no writes to records or attachments | semantic | default |
| A-004 | Not all local attachments are necessarily inside Zotero's own data directory | MVP serves only `storage:` attachments below `<dataDir>/storage`; rejects linked external files | interface | default |
| A-005 | “Real time” has no latency/cache definition | Query current SQLite state on each list/search/detail request; refresh the open panel every 15 seconds plus manual refresh | semantic | default |
| A-006 | User's Zotero data directory may be customized | Configured directory, then `ZOTERO_DB_PATH`, `ZOTERO_DATA_DIR`, then `~/Zotero`; no full-disk scan | interface | default |
| A-007 | Earlier conversation mentioned login, but latest goal specifies the local library | No Zotero account/API credential; inherit DSH session access control | semantic | user |
| A-008 | PDF preview implementation is not specified for the DSH Electron renderer | Same-origin inline PDF endpoint in a native Chromium iframe; PDF.js fallback is deferred until live installation demonstrates the native viewer is unavailable | interface | default |
| A-009 | Zotero can be syncing/indexing or use schema revisions | Bounded read-only connection; return actionable busy/unsupported-schema errors, never bypass the lock with writes | interface | default |
| A-010 | The request does not define compact list versus full item payloads | Search/list returns title, authors, date, key and attachment-presence metadata; abstract/DOI/tags are returned by item detail | interface | default |
| A-011 | The request does not define how text search treats punctuation or wildcard characters | Literal substring matching across title, creator names, and abstract; `%`, `_`, and `!` are escaped, and PDF full-text search is out of scope | semantic | default |
| A-012 | The request does not specify pagination or query-length limits | Default page size 50, maximum 100; offset is 0–1,000,000; search text is limited to 200 characters | interface | default |
| A-013 | The request does not specify default ordering of the first page | Most recently added items first (`dateAdded DESC`, then `itemID DESC`) | semantic | default |
| A-014 | The request does not define whether a parent collection includes items in descendants | Filtering matches direct Zotero collection membership only; selecting a parent does not implicitly include child collections | semantic | default |
| A-015 | The request does not specify whether multiple collections may be selected | One collection at a time via a single-select filter | interface | default |
| A-016 | One Zotero item may have several local PDF attachments | Expose all Zotero-managed PDF attachment keys in item detail, ordered by newest attachment date first; let the user choose which to open | semantic | default |
| A-017 | The browser may request only part of a PDF, and multi-range behavior is unspecified | Support one byte range per request; reject malformed and multi-range requests with 416 | interface | default |
| A-018 | The request does not specify how a nested Zotero collection hierarchy should fit the narrow DSH sidebar | Preserve parent paths and counts in a single-select filter instead of a permanently expanded tree | interface | default |

## Notes

- A-001/A-007 reflect the user's explicit latest clarification and subsequent approval of the local-only plan; they supersede any older Web API/API-key interpretation.
- A-013 was noticed immediately after the first F2 query implementation; it is recorded before further UI work and explicitly flagged for the independent sweep because it did not precede that query code.
- A-018 was noticed after the F1/F2 sidebar UI existed; it records the existing single-select filter choice. It was intended for independent silent-assumption review, but the Codex sweep did not read artifacts; this row therefore remains unverified by that review.
- Cross-model sweep status: `SWEEP_UNAVAILABLE`. The Codex MCP call failed before reading any artifact because `codex-code-mode-host.exe` was missing and Desktop access was denied as unapproved. The returned `verdict: null` is not a clean result; see `SILENT_ASSUMPTION_SWEEP.json` and `.aris/traces/research-implement-feature/2026-11-15_run01/`.
- The trace's name-based family classifier maps the caller-declared executor ID (`gpt-6-luna`) and requested reviewer ID (`gpt-6-astra`) to OpenAI; the executor identity is not host-attested, so different-family independence is not established.
- A-003/A-005 define what “read” and “real time” mean in this build. Changing either changes the data-access semantics, so the implementation must preserve these rows.
- The target repository was empty on GitHub when inspected; its URL is configured as `origin`. The user explicitly authorized normal pushes to this repository on 2026-11-15. Push only tested commits to `main`; do not force-push. That push authorization alone did not authorize profile changes; the user separately authorized local DSH installation in goal round 1, and the bundle was applied to the desktop profile.
