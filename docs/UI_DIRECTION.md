# UI direction — local literature desk

## Subject and job

A local Zotero workspace inside DSH for researchers who need to locate a library item, inspect its metadata, and comfortably read a Zotero-managed PDF without launching Zotero Desktop. The primary surface is a full-width main panel. The user's reference is the existing Zotero library plugin's two-pane library view; the narrow right-sidebar PDF reader is explicitly not the main paper-reading surface.

## Visual direction

- **Structure:** two-pane library mode: collection/tag navigation on the left, compact item table on the right. Opening a paper switches to a document-first, full-width reader mode in the main panel.
- **Color:** inherit DSH light/dark theme tokens for backgrounds, dividers, active rows, controls, and focus. Do not hard-code Zotero blue or copy another plugin's DOM/CSS.
- **Type and density:** inherit the DSH interface font; compact table headers and rows around 12–13px, collection/tag labels around 12px, and secondary status text around 11px. Prefer crisp separators over nested cards.
- **Main workspace:** register one root-scoped keyed `main` panel and a matching `sidebar.panellist` entry. Keep one library navigation pane and one item-list pane; do not render a persistent third details/PDF column.
- **Collection navigation:** show the all-items entry, hierarchical collection disclosure controls, counts, indentation, selection/hover states, plus a searchable tag list with per-tag item counts. Selecting a collection clears the active tag; selecting a tag filters the list.
- **Item table:** title, creator, and date headings use existing safe sort keys and expose direction. Keep “recently added” in the existing sort selector. Type/PDF columns are informational, not sortable.
- **Full-width reader:** opening an item replaces the library content with a reader view. PDF is the default and fills the available main-panel width/height. Provide a clear back-to-library action and real Info/PDF views; Info reuses existing bibliographic metadata, abstract, tags, and collections.
- **Compact reader:** retain the right-sidebar entry as a metadata quick preview. Its full-read action switches to the registered main panel; do not embed the narrow sidebar PDF as the primary paper-reading experience.
- **Safety:** preserve read-only SQLite, key-resolved local PDF route, storage containment, no arbitrary paths, no external Zotero API, and no fake Notes/Related/edit/import/sync controls.

## Main library sketch

```text
┌ DSH navigation: Zotero local library ──────────────────────────────────┐
│ [Back] Zotero local library · local/read-only · connection [Refresh]   │
├──────────────────────────┬────────────────────────────────────────────┤
│ Collections               │ [Search…] [Recent ▼] [↑↓]                 │
│ ▾ All items               │ Title ↕ | Creator ↕ | Date ↕ | Type | PDF │
│ ▾ Collection       count  │ Compact selected item rows                 │
│   ▸ Subcollection   count │ [Load more]                               │
│ ─ Tags ────────────────── │                                            │
│ [Search tags…]             │                                            │
│ All tags   Research   12   │                                            │
└──────────────────────────┴────────────────────────────────────────────┘
```

## Full-width reader sketch

```text
┌ DSH navigation: Zotero local library ──────────────────────────────────┐
│ [Back to library] Item title · creator · year                          │
│ [Info] [PDF]                                                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                      Full-width local PDF viewer                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## Interaction and responsive behavior

- Search covers title, creators, and abstract. Sorting is server-side and selected from a strict whitelist; pagination keeps a stable tie-breaker.
- Tag search is a debounced `q` filter on the read-only `/tags` endpoint; the selected exact tag is passed as a parameterized item-list filter.
- Selecting a row opens the paper in the full-width reader; returning to the library preserves collection, tag, query, sort, page, and selected row state.
- The sidebar quick preview displays metadata and offers a full-width read action. The full PDF does not remain confined to the narrow sidebar.
- On narrow panels, the left navigator (collections and tags) stacks above the list instead of disappearing; the reader remains a full main-panel view and does not rely on horizontal scrolling.
- Collection disclosure buttons expose `aria-expanded`; tags use `aria-pressed`; all actions remain keyboard reachable and localized.

## Review and verification status

The previous three-pane UI direction was rejected by the user after screenshot review. The installed `dsh-plugin-zotero@0.8.1` source was inspected read-only and confirmed a two-pane collection/tag + item-list library flow. The approved correction is implemented in source; 27 synthetic tests, four syntax checks, bundle validation, and diff checks pass, and source UX/API reviewers found no blockers. The updated bundle is applied and its plugin row is active. Live layout, theme contrast, and full-width Chromium PDF rendering still require the user to refresh/restart the existing DSH GUI and validate with a synthetic fixture. No real Zotero database or paper contents were inspected.
