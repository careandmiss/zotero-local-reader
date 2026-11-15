# DSH Zotero local reader

Browse a local Zotero library and read local PDF attachments from the DSH right sidebar. The Host reads `zotero.sqlite` in read-only mode and never calls Zotero's localhost API, so Zotero Desktop can be closed. No Zotero account, API key, cloud service, or MCP server is required for the panel.

## Current build status

This bundle is being built in stages. The first stage verifies the DSH sidebar and local database status. Library navigation and PDF reading arrive in later stages.

## Data and safety

- Only local, Zotero-managed files under the configured data directory are supported.
- No Zotero records, attachments, annotations, or notes are written.
- Library titles, abstracts, full text, and file paths are not sent to a network service.
- Linked files outside Zotero's `storage` directory are not served by the first version.
- If Zotero is syncing or indexing and SQLite reports a lock, retry after it finishes.

## Configuration

The plugin checks `dataDir` in its settings, `ZOTERO_DB_PATH` / `ZOTERO_DATA_DIR`, and then the standard `~/Zotero` location. Set the directory containing `zotero.sqlite` when Zotero uses a custom data directory.
