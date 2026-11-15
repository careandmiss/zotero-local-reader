# UI direction — local literature desk

## Subject and job

A local Zotero workspace inside DSH for researchers who need to locate a library item, inspect its metadata, and comfortably read a Zotero-managed PDF without launching Zotero Desktop. The main panel hosts the two-pane library and its immersive fallback reader. A Session-bound right-sidebar metadata preview opens a per-item PDF resource tab rendered with DSH's native document-preview PDF canvas (the screenshots 2/3 style); DSH's native fullscreen presentation expands that same tab.

## Visual direction

- **Structure:** two-pane library mode: collection/tag navigation on the left, compact item table on the right. Opening a row in the global main panel enters the immersive fallback reader. A separate Session-bound right-sidebar metadata preview opens a native-style PDF resource tab; DSH's rightbar fullscreen control expands that same tab without changing its content tree.
- **Color:** inherit DSH light/dark theme tokens for backgrounds, dividers, active rows, controls, and focus. Do not hard-code Zotero blue or copy another plugin's DOM/CSS.
- **Type and density:** inherit the DSH interface font; compact table headers and rows around 12–13px, collection/tag labels around 12px, and secondary status text around 11px. Prefer crisp separators over nested cards.
- **Main workspace:** register one root-scoped keyed `main` panel and a matching `sidebar.panellist` entry labeled “Zotero Local Reader” / “Zotero 本地阅读器”. If the user has not pinned it, DSH places the entry in the sidebar's “More” menu; pinning is in-memory and may reset after plugin reload. Keep one library navigation pane and one item-list pane; do not render a persistent third details/PDF column.
- **Collection navigation:** show the all-items entry, hierarchical collection disclosure controls, counts, indentation, selection/hover states, plus a searchable tag list with per-tag item counts. Selecting a collection clears the active tag; selecting a tag filters the list.
- **Item table:** title, creator, and date headings use existing safe sort keys and expose direction. Keep “recently added” in the existing sort selector. Type/PDF columns are informational, not sortable.
- **Sidebar PDF resource:** the Session-bound metadata preview opens a key-addressed rightbar tab. The body reuses DSH's registered `ui-sidebar-documentpreview` PDF canvas via its `sidebar.right.tab.document` child slot and feeds it bytes from the existing same-origin API. Never render the browser's PDF iframe in this side/fullscreen route, and never put Zotero storage paths into the resource URI or header.
- **Fullscreen:** use the DSH rightbar's native `push` / `fullscreen` presentation. The same tab and native PDF canvas remain mounted, so users can read in the side panel or expand it across the window.
- **Immersive main fallback:** retain the separate full-width streaming reader as an alternative from metadata preview. Hide the plugin header and metadata and keep a floating return-to-library action; its root-scoped global `main` panel cannot use the Session-bound document preview slot.
- **Metadata preview:** the compact right-sidebar entry is Session-bound. Its details view offers both “Open PDF in sidebar” (a keyed resource tab) and “Read PDF in main workspace” (the immersive `main` panel). The global main panel never calls `sidebarRight.openResource()` because it has no mounted Session.
- **Safety:** preserve read-only SQLite, key-resolved local PDF route, storage containment, no arbitrary paths, no external Zotero API, and no fake Notes/Related/edit/import/sync controls.

## Main library sketch

```text
┌ DSH navigation: Zotero Local Reader ──────────────────────────────────┐
│ [Back] Zotero Local Reader · local/read-only · connection [Refresh]   │
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

## Reader mode sketches

```text
Global main panel: clicking a row enters the immersive reader
┌ DSH navigation ────────────────────────────────────────────────────────┐
│ [Floating back to library]                                             │
│                       Local PDF fills main panel                       │
└────────────────────────────────────────────────────────────────────────┘
```

```text
Active DSH Session: metadata preview opens a separate side PDF tab
┌ Conversation / session content ─────────────┬ DSH rightbar ────────────┐
│                                             │ [Metadata] [Paper PDF]   │
│                                             │ ┌──────────────────────┐ │
│                                             │ │ Local PDF            │ │
│                                             │ └──────────────────────┘ │
└─────────────────────────────────────────────┴──────────────────────────┘

```text
DSH rightbar native fullscreen mode: same PDF tab, expanded to the window
┌ DSH fullscreen control / tab chrome ──────────────────────────────────┐
│                                                                        │
│                      Local PDF fills the panel                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```



## Interaction and responsive behavior

- Search covers title, creators, and abstract. Sorting is server-side and selected from a strict whitelist; pagination keeps a stable tie-breaker.
- Tag search is a debounced `q` filter on the read-only `/tags` endpoint; the selected exact tag is passed as a parameterized item-list filter.
- Opening a row in the global main library enters the immersive reader; returning preserves collection, tag, query, sort, pagination, and selected row state.
- In an active DSH Session, the metadata quick preview offers an “Open PDF in sidebar” action. It opens a separate rightbar resource tab; DSH's native fullscreen control expands that same tab across the window, and the same host control returns to side mode.
- The metadata quick preview also offers a full-width main-panel reader action. The root-scoped global main panel must not call `sidebarRight.openResource()` because no Session is mounted while it fills the main column.
- On narrow panels, the left navigator (collections and tags) stacks above the list instead of disappearing; the PDF resource remains sized to its host panel, and fullscreen behavior is owned by DSH.
- Collection disclosure buttons expose `aria-expanded`; tags use `aria-pressed`; all actions remain keyboard reachable and localized.

## Review and verification status

The previous three-pane UI direction was rejected after screenshot review. Technical review confirmed `sidebarRight.openResource()` requires a mounted Session, which the global `main` panel does not provide; the user accepted the Session-bound metadata-preview entry point. After seeing screenshots 1–3, the user approved replacing the browser iframe in the side/fullscreen resource tab with DSH's built-in document-preview PDF canvas, fed only by the existing key-based same-origin API. The native renderer implementation now exists in source; 27 synthetic tests, four syntax checks, bundle validation, and diff checks pass. Read-only API and UX reviews found no remaining blocker after adding a persistent main-reader fallback in the PDF header. A follow-up discovery fix renames the panel/guide to “Zotero 本地阅读器” / “Zotero Local Reader” and documents its location under More when unpinned. Known scope limits: the global library row still opens the streaming main-workspace fallback (by design), multiple attachments still select the first PDF, and byte-download progress is indeterminate. The implementation is committed and pushed as `0566b06`. The active profile already has the bundle enabled and linked to this workspace; `install_bundle` returned `already-installed` (`changed:false`), so no remove/reinstall or profile mutation occurred. Visual verification awaits runtime reload and user testing in the existing GUI. No real Zotero database or paper contents were inspected.
