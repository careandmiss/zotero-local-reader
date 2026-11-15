# DSH Zotero local reader

A DSH right-sidebar plugin for browsing the local Zotero library and reading local PDF attachments without keeping Zotero Desktop open. It is a Host + Client plugin bundle, not just an MCP tool.

## Status

F0 is being built: plugin metadata, DSH sidebar registration, and a safe local database health endpoint. Collection browsing and PDF reading follow in the approved F1–F4 plan. See [`plan.md`](plan.md), [`spec.md`](spec.md), and [`ASSUMPTIONS.md`](ASSUMPTIONS.md).

## Privacy

The design is local-only and read-only. It does not require a Zotero API key and does not upload library contents. Tests use synthetic fixtures; do not copy `zotero.sqlite`, attachments, PDFs, or metadata into this repository.
