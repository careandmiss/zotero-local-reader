# DSH Zotero local reader

A DSH right-sidebar plugin for browsing the local Zotero library and reading local PDF attachments without keeping Zotero Desktop open. It is a Host + Client plugin bundle, not just an MCP tool.

## Status

F0 and F1 are implemented: the bundle registers a DSH right-sidebar tab, reports local database status, and reads a synthetic/tested local collection tree through a read-only SQLite connection. F2 item search/details and F3 PDF reading remain in the approved plan. See [`plan.md`](plan.md), [`spec.md`](spec.md), and [`ASSUMPTIONS.md`](ASSUMPTIONS.md).

## Privacy

The design is local-only and read-only. It does not require a Zotero API key and does not upload library contents. Tests use synthetic fixtures; do not copy `zotero.sqlite`, attachments, PDFs, or metadata into this repository.
