# UI direction — local literature desk

## Subject and job

A local Zotero workspace inside DSH for researchers who need to locate a library item, inspect its metadata, and read a Zotero-managed PDF without launching Zotero Desktop. The primary surface is a full-width main panel; the existing right-sidebar reader remains as a compact quick-access path.

## Visual direction

- **Color:** inherit DSH light/dark theme tokens. The original icon uses deep blue-green `#17252D`, paper `#F0EEE7`, pale leaf `#D8E7E2`, muted green `#56766D`, and a restrained terracotta lens `#D76545`.
- **Type:** inherit the DSH interface font. Keep primary list rows and collection labels around 12px for readability; use slightly smaller utility/status text only where secondary.
- **Main workspace:** register one root-scoped keyed `main` panel and a matching `sidebar.panellist` entry. The three panes are collections, searchable/sortable item list, and item details/PDF. The right-sidebar `sidebar.right.pane.tab` registration remains separate and compact.
- **Collection navigation:** show a hierarchical tree with disclosure buttons, counts, selected state, and a collection filter fallback at narrow widths.
- **Responsive behavior:** use three panes when space permits, two columns when the main panel narrows, and list/detail navigation on narrow screens. Preserve access to collection filtering and the existing back-to-list action; prevent forced horizontal overflow.
- **Signature:** the book-spread icon signals a personal reference library. Keep visual emphasis in the icon, status, and selected row rather than repeating decoration on every item.

## Main workspace sketch

```text
┌ DSH navigation: Zotero local library ─────────────────────────────┐
│ [Back to conversation] Zotero local library       [Refresh]       │
│ ● Local, read-only                                                  │
├──────────────────┬────────────────────────┬───────────────────────┤
│ Collections      │ Search / sort           │ Item details          │
│ ▾ All items      │ Title | Creator | Date  │ Title, abstract, DOI  │
│ ▾ Collection     │ ─────────────────────── │ Tags / collections    │
│   ▸ Subcollection│ Search result rows      │ Local PDF selector    │
│                  │ [Load more]              │ Embedded PDF viewer   │
└──────────────────┴────────────────────────┴───────────────────────┘

Right sidebar: compact search/list/detail quick reader remains available.
```

## Interaction and safety

- Search covers title, creators, and abstract. Sorting is server-side and selected from a strict whitelist (recently added, title, date, creator); pagination keeps a stable tie-breaker.
- Collection disclosure buttons use `aria-expanded` and localized labels; selecting a collection filters the list. The narrow layout also exposes the collection select control.
- Selecting a row loads item metadata and local PDF attachments in the detail pane. On narrow screens, a back action returns to the same list.
- The reader continues to use read-only SQLite and the same-origin PDF route. It does not access linked files outside Zotero `storage/`, call Zotero Web API, or send library contents to a cloud service.

## Review and verification status

A UI/UX reviewer identified non-collapsible collection navigation and small list/collection typography; both were addressed with accessible tree disclosures and larger primary labels. Follow-up identified that collapsing an ancestor could hide the active collection; the current handler moves the filter to the visible collapsed parent, and the reviewer confirmed this source-level resolution. Final checks pass (25/25 synthetic tests, syntax, bundle, and diff). The updated bundle is installed and its row is active; DSH must restart to load a fresh Client module generation. Authenticated GUI validation remains pending, so the agent cannot verify live rendering, light/dark contrast, or responsive behavior. Earlier user screenshots showed the pre-update right-sidebar reader and embedded PDF viewer; they do not verify this new main workspace. The known real-library read error is separate and remains unresolved; no real Zotero database was inspected.
