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
| A-008 | PDF preview implementation is not specified for the DSH Electron renderer | Same-origin inline PDF endpoint and native Chromium viewer first; if runtime lacks PDF rendering, use bundled PDF.js | interface | default |
| A-009 | Zotero can be syncing/indexing or use schema revisions | Bounded read-only connection; return actionable busy/unsupported-schema errors, never bypass the lock with writes | interface | default |

## Notes

- A-001/A-007 reflect the user's explicit latest clarification and subsequent approval of the local-only plan; they supersede any older Web API/API-key interpretation.
- A-003/A-005 define what “read” and “real time” mean in this build. Changing either changes the data-access semantics, so the implementation must preserve these rows.
- The target repository was empty on GitHub when inspected; its URL is configured as `origin`. No push has been made or is implied.
