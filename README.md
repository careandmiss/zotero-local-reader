# DSH Zotero local reader

A DSH right-sidebar plugin for browsing the local Zotero library and reading local PDF attachments without keeping Zotero Desktop open. It is a Host + Client plugin bundle, not just an MCP tool.

## Status

F0–F3 are implemented: the bundle registers a DSH right-sidebar tab, reads a local collection tree, supports literal title/author/abstract search, paginates results, opens item details, and streams Zotero-managed PDFs inline with byte-range support. All database access is read-only. Live native-viewer rendering remains unverified until profile installation. See [`plan.md`](plan.md), [`spec.md`](spec.md), and [`ASSUMPTIONS.md`](ASSUMPTIONS.md).

## Privacy

The design is local-only and read-only. It does not require a Zotero API key and does not upload library contents. Tests use synthetic fixtures; do not copy `zotero.sqlite`, attachments, PDFs, or metadata into this repository.
