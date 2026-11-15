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

The subject warrants a paper-and-reader motif, but the sidebar itself should remain native to DSH rather than force a beige reading app onto the user's theme. The initial F0 panel is only a connection-state skeleton; its “next build step” placeholder must be removed when F2/F3 land. The proposed signature is concentrated in the icon and status treatment, not repeated as decoration in every row.
