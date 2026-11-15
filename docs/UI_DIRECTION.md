# UI direction — local literature desk

## Subject and job

A local Zotero workspace inside DSH for researchers who need to locate a library item, inspect its metadata, and read a Zotero-managed PDF without launching Zotero Desktop. The primary surface is a full-width main panel; the existing right-sidebar reader remains as a compact quick-access path.

## Visual direction

- **Visual direction:** restrained, information-dense Zotero library workbench rather than a decorative dashboard. Match the familiar collection-tree → item-table → selected-item-inspector hierarchy; this is structural/typographic alignment, not a pixel-perfect clone because no reference screenshot or exact Zotero version was provided.
- **Color:** inherit DSH light/dark theme tokens for backgrounds, dividers, active rows, controls, and focus. Do not hard-code Zotero blue or reuse the icon palette as interface chrome.
- **Type and density:** inherit the DSH interface font; compact table headers and rows around 12–13px, collection labels around 12px, and secondary status text around 11px. Prefer crisp separators and restrained radii over nested cards.
- **Main workspace:** register one root-scoped keyed `main` panel and a matching `sidebar.panellist` entry. The three panes are collections, searchable/sortable item table, and an inspector with real `Info` / `PDF` tabs. The right-sidebar `sidebar.right.pane.tab` registration remains separate and compact.
- **Collection navigation:** keep the “All items” entry, hierarchical disclosure controls, counts, indentation, selected/hover states, and a collection-filter fallback at narrow widths.
- **Item table:** align compact column headings and rows; title, creator, and date headings operate existing safe sort keys and expose direction. Keep “recently added” in the existing sort selector. Do not imply type/PDF are sortable.
- **Inspector:** keep selected item's title/creator visible above the tabs. `Info` shows existing bibliographic metadata/abstract/tags/collections; `PDF` shows existing attachment selection/status/viewer. Do not add fake Notes, Related, editing, import, or sync affordances.
- **Responsive behavior:** use three panes when space permits, two columns when the main panel narrows, and list/detail navigation on narrow screens. Preserve access to collection filtering and the existing back-to-list action; prevent forced horizontal overflow.
- **Compact reader:** retain its existing right-sidebar behavior; Zotero-native styling applies to the full-width main workspace.

## Main workspace sketch

```text
┌ DSH navigation: Zotero local library ─────────────────────────────┐
│ [Back] Zotero local library · local/read-only · connection [Refresh]│
├──────────────────┬────────────────────────┬───────────────────────┤
│ Collections      │ [Search…] [Recent ▼]    │ Selected item title   │
│ ▾ All items      │ Title ↕ | Creator ↕     │ Creator · year        │
│ ▾ Collection     │ Date ↕ | Type | PDF     │ [Info] [PDF]           │
│   ▸ Subcollection│ Compact selected row    │ Metadata / PDF viewer │
│                  │ [Load more]              │                       │
└──────────────────┴────────────────────────┴───────────────────────┘

Right sidebar: compact search/list/detail quick reader remains available.
```

## Interaction and safety

- Search covers title, creators, and abstract. Sorting is server-side and selected from a strict whitelist (recently added, title, date, creator); pagination keeps a stable tie-breaker.
- Collection disclosure buttons use `aria-expanded` and localized labels; selecting a collection filters the list. The narrow layout also exposes the collection select control.
- Selecting a row loads item metadata and local PDF attachments in the detail pane. On narrow screens, a back action returns to the same list.
- The reader continues to use read-only SQLite and the same-origin PDF route. It does not access linked files outside Zotero `storage/`, call Zotero Web API, or send library contents to a cloud service.

## Review and verification status

A UI/UX reviewer identified non-collapsible collection navigation, small labels, and active-filter visibility issues; those fixes were confirmed at source level. For this Zotero-style refinement, the reviewer confirmed native table semantics, active-only `aria-sort`, real Info/PDF content, accessible PDF status, and no remaining source-level blocker. Final checks pass (25/25 synthetic tests, four syntax checks, bundle, and diff). The prior bundle is active in the DSH profile, but the user restarted before this latest source edit; restart again to load it. No authenticated GUI validation or exact Zotero reference screenshot/version is available, so live rendering, theme contrast, and responsive fit remain unverified; this is structural/density matching, not pixel-level reproduction. The known real-library read error is separate and remains unresolved; no real Zotero database was inspected.
