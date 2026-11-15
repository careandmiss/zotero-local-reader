# UI direction — local literature desk

## Subject and job

A reader inside the DSH right sidebar for researchers opening locally managed Zotero papers. Its one job is to help the user find a library item and read the attached PDF without launching Zotero Desktop.

## Compact token plan

- **Color:** the application UI inherits DSH light/dark theme tokens. The plugin's original icon uses deep blue-green `#17252D`, paper `#F0EEE7`, pale leaf `#D8E7E2`, muted green `#56766D`, and one restrained terracotta lens `#D76545`.
- **Type:** inherit DSH's interface sans for labels and paper metadata; use a compact 11px uppercase utility label only for the local/read-only status. No forced font faces that could clash with the user's DSH theme.
- **Layout:** a narrow single-column reading desk: persistent title/status header, search and collection filter, list rows, then a focused item reader. Do not squeeze a three-column desktop library into the sidebar.
- **Signature:** a book-spread with a small terracotta reading lens — the icon ties a personal reference library to the act of close reading, rather than adding a generic Zotero badge.

## Wireframe

```text
┌ Zotero 本地库 · LOCAL / READ ONLY · ↻ ┐
│ [ Search title, author, abstract…     ] │
│ [ All collections                ▾   ] │
│ ┌ Article title                         │
│ │ Author · year · PDF                   │
│ ├ Article title                         │
│ │ Author · year · no local PDF          │
│ └ …                                     │
└────────────────────────────────────────┘

On selection: item metadata → inline PDF reader; Back returns to the same list.
```

## Self-critique

The subject warrants a paper-and-reader motif, but the sidebar itself remains native to DSH rather than forcing a beige reading app onto the user's theme. F0–F3 now provide collection filtering, metadata, multiple local PDF attachments, and a same-origin inline reader. Synthetic HTTP tests cover the reader route; actual Chromium PDF rendering and light/dark slot display remain unverified until profile installation. The signature stays concentrated in the icon and status treatment rather than repeating as decoration in every row.
