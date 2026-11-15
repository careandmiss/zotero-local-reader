window.__ModuleLoader__.load({
  id: '@local/zotero-local-reader',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React
    const NS = 'zotero-local-reader'
    const API = '/dsh-zotero-local/api'
    let pendingMainReaderRequest = null
    let mainReaderSequence = 0
    const mainReaderSubscribers = new Set()
    function requestMainReader(item) {
      const request = { id: ++mainReaderSequence, item }
      pendingMainReaderRequest = request
      for (const subscriber of mainReaderSubscribers) subscriber(request)
    }

    const dictionaries = {
      zh: {
        'tab.title': 'Zotero 本地库',
        'guide.title': 'Zotero 本地库',
        'guide.description': '在 DSH 主工作区中整理、搜索并阅读本机 Zotero 文献。',
        'status.checking': '正在检查本地文库…',
        'status.ready': '本地文库已连接',
        'status.missing': '未找到 Zotero 数据库',
        'status.busy': 'Zotero 正在同步或索引',
        'status.error': '无法读取 Zotero 数据库',
        'action.retry': '重新检查',
        'action.back': '返回文献列表',
        'action.backConversation': '返回对话',
        'action.loadMore': '加载更多',
        'workspace.collections': '集合',
        'workspace.expandCollection': '展开集合',
        'workspace.collapseCollection': '折叠集合',
        'workspace.items': '文献',
        'workspace.tags': '标签',
        'workspace.searchTags': '搜索标签',
        'workspace.allTags': '全部标签',
        'workspace.noTags': '当前范围没有标签。',
        'workspace.tagError': '标签加载失败，请重试。',
        'workspace.collapseTags': '折叠标签',
        'workspace.expandTags': '展开标签',
        'workspace.selectItem': '选择一篇文献以查看详情',
        'action.openFullReader': '在主工作区阅读 PDF',
        'action.backToLibrary': '返回文献库',
        'reader.emptyPdf': '这篇文献没有可在 Zotero 存储中读取的 PDF。',
        'workspace.sort': '排序依据',
        'workspace.sortDirection': '排序方向',
        'workspace.infoTab': '信息',
        'workspace.pdfTab': 'PDF',
        'sort.recent': '最近添加',
        'sort.title': '标题',
        'sort.date': '日期',
        'sort.author': '作者',
        'sort.ascending': '升序',
        'sort.descending': '降序',
        'search.label': '搜索文献',
        'search.placeholder': '搜索标题、作者或摘要…',
        'collection.label': '筛选集合',
        'collection.all': '全部集合',
        'item.loading': '正在读取文献…',
        'item.loadingList': '正在加载文献…',
        'item.emptyLibrary': '这个文库里还没有可显示的文献条目。',
        'item.noResults': '没有找到匹配的文献。',
        'item.error': '文献列表读取失败，请重试。',
        'item.detailError': '无法读取这篇文献的元数据。',
        'item.authorUnknown': '作者信息缺失',
        'item.untitled': '未命名文献',
        'item.noAbstract': 'Zotero 条目没有摘要。',
        'item.noPdf': '条目没有记录本地 PDF',
        'item.pdfAttached': '条目记录关联了 Zotero 存储中的 PDF',
        'item.pdfHeading': '本地 PDF',
        'item.pdfSelect': '选择 PDF 附件',
        'item.pdfLabel': 'PDF 附件',
        'item.pdfChecking': '正在检查附件…',
        'item.pdfMissing': '本地 PDF 缺失、为空或不在 Zotero 存储目录中。',
        'item.pdfError': '无法检查或打开 PDF。请检查文库连接后重试。',
        'item.pdfViewerTitle': '本地 PDF 阅读器',
        'action.retryDetail': '重试读取详情',
        'action.retryPdf': '重试检查 PDF',
        'action.retryList': '重试加载文献',
        'item.countSuffix': '篇',
        'item.detail': '文献详情',
        'item.title': '标题',
        'item.authors': '作者',
        'item.date': '日期',
        'item.type': '类型',
        'item.pdfShort': 'PDF',
        'item.abstract': '摘要',
        'item.tags': '标签',
        'item.collections': '所属集合',
        'item.doi': 'DOI',
        'item.journal': '期刊 / 出版物',
        'empty.hint': '确认 Zotero 数据目录，或在插件设置中配置数据目录。',
        'busy.hint': '等待片刻后重试；读取器不会修改数据库。',
        'error.hint': '检查数据目录和 Zotero 数据库版本后重试。',
        'footer.local': 'Zotero 桌面端可以保持关闭。内容只在本机读取。',
      },
      en: {
        'tab.title': 'Zotero local library',
        'guide.title': 'Zotero local library',
        'guide.description': 'Browse, search, and read your local Zotero library in the DSH workspace.',
        'status.checking': 'Checking the local library…',
        'status.ready': 'Local library connected',
        'status.missing': 'Zotero database not found',
        'status.busy': 'Zotero is syncing or indexing',
        'status.error': 'Could not read the Zotero database',
        'action.retry': 'Check again',
        'action.back': 'Back to papers',
        'action.backConversation': 'Back to conversation',
        'action.loadMore': 'Load more',
        'workspace.collections': 'Collections',
        'workspace.expandCollection': 'Expand collection',
        'workspace.collapseCollection': 'Collapse collection',
        'workspace.items': 'Items',
        'workspace.tags': 'Tags',
        'workspace.searchTags': 'Search tags',
        'workspace.allTags': 'All tags',
        'workspace.noTags': 'No tags in this scope.',
        'workspace.tagError': 'Could not load tags. Try again.',
        'workspace.collapseTags': 'Collapse tags',
        'workspace.expandTags': 'Expand tags',
        'workspace.selectItem': 'Select an item to view its details',
        'action.openFullReader': 'Read PDF in main workspace',
        'action.backToLibrary': 'Back to library',
        'reader.emptyPdf': 'This item has no readable PDF in Zotero storage.',
        'workspace.sort': 'Sort by',
        'workspace.sortDirection': 'Sort direction',
        'workspace.infoTab': 'Info',
        'workspace.pdfTab': 'PDF',
        'sort.recent': 'Recently added',
        'sort.title': 'Title',
        'sort.date': 'Date',
        'sort.author': 'Creator',
        'sort.ascending': 'Ascending',
        'sort.descending': 'Descending',
        'search.label': 'Search papers',
        'search.placeholder': 'Search title, author, or abstract…',
        'collection.label': 'Filter by collection',
        'collection.all': 'All collections',
        'item.loading': 'Reading item…',
        'item.loadingList': 'Loading papers…',
        'item.emptyLibrary': 'There are no bibliographic items to show in this library.',
        'item.noResults': 'No matching papers found.',
        'item.error': 'Could not load the paper list. Try again.',
        'item.detailError': 'Could not read this item’s metadata.',
        'item.authorUnknown': 'Author information unavailable',
        'item.untitled': 'Untitled item',
        'item.noAbstract': 'This Zotero item has no abstract.',
        'item.noPdf': 'No local PDF is recorded for this item',
        'item.pdfAttached': 'A PDF attachment is recorded in Zotero storage',
        'item.pdfHeading': 'Local PDF',
        'item.pdfSelect': 'Choose a PDF attachment',
        'item.pdfLabel': 'PDF attachment',
        'item.pdfChecking': 'Checking attachment…',
        'item.pdfMissing': 'The local PDF is missing, empty, or outside Zotero storage.',
        'item.pdfError': 'Could not check or open the PDF. Check the library connection and retry.',
        'item.pdfViewerTitle': 'Local PDF reader',
        'action.retryDetail': 'Retry item details',
        'action.retryPdf': 'Retry PDF check',
        'action.retryList': 'Retry paper list',
        'item.countSuffix': 'items',
        'item.detail': 'Item details',
        'item.title': 'Title',
        'item.authors': 'Creator',
        'item.date': 'Date',
        'item.type': 'Type',
        'item.pdfShort': 'PDF',
        'item.abstract': 'Abstract',
        'item.tags': 'Tags',
        'item.collections': 'Collections',
        'item.doi': 'DOI',
        'item.journal': 'Journal / publication',
        'empty.hint': 'Confirm the Zotero data directory or set it in plugin settings.',
        'busy.hint': 'Wait briefly and retry. The reader never writes to the database.',
        'error.hint': 'Check the data directory and Zotero database version, then retry.',
        'footer.local': 'Zotero Desktop can remain closed. Content stays on this device.',
      },
    }

    const buttonStyle = {
      border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))',
      background: 'transparent',
      color: 'inherit',
      borderRadius: 7,
      padding: '7px 9px',
      cursor: 'pointer',
      font: 'inherit',
      fontSize: 12,
    }
    const fieldStyle = {
      boxSizing: 'border-box',
      width: '100%',
      minHeight: 34,
      padding: '7px 9px',
      border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))',
      borderRadius: 8,
      background: 'var(--dsw-alias-bg-layer-1, transparent)',
      color: 'var(--dsw-alias-label-primary, CanvasText)',
      font: 'inherit',
      fontSize: 12,
    }
    const workspaceCss = `
      .zlr-panel--wide { container-type: inline-size; container-name: zlr-main; }
      .zlr-main-toolbar { box-sizing: border-box; display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 6px 10px; border-bottom: .5px solid var(--dsw-alias-border-l3); flex-wrap: wrap; }
      .zlr-toolbar-mark { display: grid; place-items: center; width: 28px; height: 28px; border-radius: var(--dsw-radius-sm, 4px); background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-secondary); }
      .zlr-toolbar-title { min-width: 0; flex: 1; }
      .zlr-toolbar-kicker { color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 15px; letter-spacing: .04em; }
      .zlr-status-inline { display: inline-flex; align-items: center; gap: 6px; flex: 0 0 auto; color: var(--dsw-alias-label-secondary); font-size: 11px; font-weight: 500; }
      .zlr-status-inline > span:first-child { width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; }
      .zlr-library-grid {
        box-sizing: border-box; display: grid; grid-template-columns: minmax(210px, 270px) minmax(0, 1fr);
        min-height: 0; flex: 1; overflow: hidden; background: var(--dsw-alias-bg-layer-1);
      }
      .zlr-pane { box-sizing: border-box; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
      .zlr-library-nav { border-right: .5px solid var(--dsw-alias-border-l3); background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-1)); }
      .zlr-collections { flex: 1 1 55%; gap: 1px; padding: 8px 6px; overflow-y: auto; }
      .zlr-tags-panel { display: flex; flex: 0 1 45%; min-height: 110px; flex-direction: column; border-top: .5px solid var(--dsw-alias-border-l3); padding: 8px 6px; }
      .zlr-tags-panel[data-collapsed='true'] { flex: 0 0 auto; min-height: 0; }
      .zlr-tag-list { min-height: 0; flex: 1; overflow: auto; margin-top: 4px; }
      .zlr-tag-button { box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 6px; width: 100%; min-height: 26px; padding: 4px 7px; border: 0; border-radius: var(--dsw-radius-sm, 4px); background: transparent; color: var(--dsw-alias-label-secondary); text-align: left; cursor: pointer; font: inherit; font-size: 11.5px; }
      .zlr-tag-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .zlr-tag-button[aria-pressed='true'] { background: var(--dsw-alias-interactive-bg-active, var(--dsw-alias-interactive-bg-hover)); color: var(--dsw-alias-label-primary); }
      .zlr-tag-button:focus-visible, .zlr-tag-toggle:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 1px; }
      .zlr-list-pane { gap: 8px; padding: 8px 10px; }
      .zlr-list-toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .zlr-search-label { display: flex; flex: 1 1 220px; min-width: 150px; flex-direction: column; gap: 0; color: var(--dsw-alias-label-secondary); font-size: 12px; }
      .zlr-panel--wide .zlr-field-label { display: none; }
      .zlr-panel--wide .zlr-collection-filter { display: none; }
      .zlr-sort-controls { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
      .zlr-workspace-list { display: block; flex: 1; min-height: 0; overflow: auto; margin: 0 -10px; }
      .zlr-table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 12px; }
      .zlr-table th, .zlr-table td { box-sizing: border-box; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; vertical-align: middle; }
      .zlr-table th:nth-child(1), .zlr-table td:nth-child(1) { width: 39%; }
      .zlr-table th:nth-child(2), .zlr-table td:nth-child(2) { width: 27%; }
      .zlr-table th:nth-child(3), .zlr-table td:nth-child(3) { width: 13%; }
      .zlr-table th:nth-child(4), .zlr-table td:nth-child(4) { width: 13%; }
      .zlr-table th:nth-child(5), .zlr-table td:nth-child(5) { width: 8%; }
      .zlr-row--header th { position: sticky; top: 0; z-index: 1; padding: 4px 8px; border-bottom: .5px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-secondary); font-size: 11.5px; font-weight: 500; }
      .zlr-column-heading { display: inline-flex; align-items: center; gap: 3px; max-width: 100%; padding: 3px 4px; border: 0; border-radius: var(--dsw-radius-sm, 4px); background: transparent; color: inherit; cursor: pointer; font: inherit; text-align: left; }
      .zlr-column-heading:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .zlr-column-heading:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 1px; }
      .zlr-row--item { cursor: pointer; }
      .zlr-row--item td { padding: 6px 8px; border-bottom: .5px solid var(--dsw-alias-border-l3); color: var(--dsw-alias-label-secondary); }
      .zlr-row--item:hover td { background: var(--dsw-alias-interactive-bg-hover); }
      .zlr-row--item[data-selected='true'] td { background: var(--dsw-alias-interactive-bg-active, var(--dsw-alias-interactive-bg-hover)); color: var(--dsw-alias-label-primary); }
      .zlr-row--item:focus-within { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: -2px; }
      .zlr-row-select { max-width: 100%; padding: 0; border: 0; background: transparent; color: var(--dsw-alias-label-primary); cursor: pointer; font: inherit; font-weight: 600; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .zlr-row-select:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 1px; }
      .zlr-visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      .zlr-table th.zlr-row-type, .zlr-table td.zlr-row-type, .zlr-table th.zlr-row-pdf, .zlr-table td.zlr-row-pdf { text-align: center; }
      .zlr-collection-button { box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 6px; width: 100%; min-height: 28px; padding: 4px 6px; border: 0; border-radius: var(--dsw-radius-sm, 4px); background: transparent; color: var(--dsw-alias-label-secondary); text-align: left; cursor: pointer; font: inherit; font-size: 12px; }
      .zlr-collection-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .zlr-collection-button[aria-current='page'] { background: var(--dsw-alias-interactive-bg-active, var(--dsw-alias-interactive-bg-hover)); color: var(--dsw-alias-label-primary); }
      .zlr-collection-name { display: flex; align-items: center; gap: 6px; min-width: 0; flex: 1 1 0; }
      .zlr-collection-name > svg { flex: 0 0 auto; color: var(--dsw-alias-label-tertiary); }
      .zlr-collection-disclosure { box-sizing: border-box; display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 28px; padding: 0; border: 0; border-radius: var(--dsw-radius-sm, 4px); background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; font: inherit; font-size: 14px; }
      .zlr-collection-disclosure:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
      .zlr-detail-view { display: flex; flex: 1; min-width: 0; min-height: 0; flex-direction: column; overflow: hidden; }
      .zlr-detail-tabs { display: flex; align-items: flex-end; gap: 18px; flex: 0 0 auto; padding: 0 14px; border-bottom: .5px solid var(--dsw-alias-border-l2); }
      .zlr-reader-topline { display: flex; align-items: center; gap: 10px; padding: 7px 12px; border-bottom: .5px solid var(--dsw-alias-border-l3); }
      .zlr-reader-body { display: flex; flex: 1; min-width: 0; min-height: 0; overflow: hidden; }
      .zlr-reader-info { flex: 1; min-width: 0; overflow: auto; padding: 16px 22px; }
      .zlr-reader-pdf { display: flex; flex: 1; min-width: 0; min-height: 0; flex-direction: column; overflow: hidden; padding: 8px 10px 10px; }
      .zlr-reader-pdf .zlr-pdf-view { flex: 1; min-height: 0; }
      .zlr-detail-tab { position: relative; padding: 7px 1px 8px; border: 0; background: transparent; color: var(--dsw-alias-label-tertiary); cursor: pointer; font: inherit; font-size: 12px; }
      .zlr-detail-tab[aria-pressed='true'] { color: var(--dsw-alias-label-primary); }
      .zlr-detail-tab[aria-pressed='true']::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; border-radius: 2px 2px 0 0; background: var(--dsw-alias-label-primary); content: ''; }
      .zlr-detail-tab:focus-visible { outline: var(--dsw-focus-ring-width, 2px) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary)); outline-offset: 2px; }
      .zlr-pdf-view { display: flex; flex-direction: column; gap: 8px; }
      @media (max-width: 1180px) {
        .zlr-library-grid { grid-template-columns: minmax(180px, 230px) minmax(0, 1fr); }
      }
      @media (max-width: 760px) {
        .zlr-library-grid { display: flex; flex-direction: column; }
        .zlr-library-nav { flex: 0 0 220px; max-height: 42%; border-right: 0; border-bottom: .5px solid var(--dsw-alias-border-l3); }
        .zlr-collections { flex: 1 1 55%; min-height: 60px; }
        .zlr-tags-panel { flex: 0 1 45%; min-height: 80px; }
        .zlr-list-pane { display: flex; flex: 1; }
        .zlr-row-type { display: none; }
        .zlr-table th:nth-child(1), .zlr-table td:nth-child(1) { width: 48%; }
        .zlr-table th:nth-child(2), .zlr-table td:nth-child(2) { width: 31%; }
        .zlr-table th:nth-child(3), .zlr-table td:nth-child(3) { width: 17%; }
        .zlr-table th:nth-child(5), .zlr-table td:nth-child(5) { width: 4%; }
      }
      @container zlr-main (max-width: 950px) {
        .zlr-library-grid { grid-template-columns: minmax(180px, 225px) minmax(0, 1fr); }
      }
      @container zlr-main (max-width: 660px) {
        .zlr-library-grid { display: flex; flex-direction: column; }
        .zlr-library-nav { flex: 0 0 210px; max-height: 42%; border-right: 0; border-bottom: .5px solid var(--dsw-alias-border-l3); }
        .zlr-collections { flex: 1 1 55%; min-height: 60px; }
        .zlr-tags-panel { flex: 0 1 45%; min-height: 80px; }
        .zlr-list-pane { display: flex; flex: 1; }
        .zlr-row-type { display: none; }
        .zlr-table th:nth-child(1), .zlr-table td:nth-child(1) { width: 48%; }
        .zlr-table th:nth-child(2), .zlr-table td:nth-child(2) { width: 31%; }
        .zlr-table th:nth-child(3), .zlr-table td:nth-child(3) { width: 17%; }
        .zlr-table th:nth-child(5), .zlr-table td:nth-child(5) { width: 4%; }
      }
    `

    function ReaderIcon({ size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 5.5c2.7-.9 5.3-.6 8 1v13c-2.7-1.6-5.3-1.9-8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M20 5.5c-2.7-.9-5.3-.6-8 1v13c2.7-1.6 5.3-1.9 8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M7 9h2.5M7 12h2.5m5-3H17m-2.5 3H17', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      )
    }

    function CollectionIcon({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 20 20', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M2.5 5.25h5.6l1.55 1.8h7.85v8.7H2.5z', stroke: 'currentColor', strokeWidth: 1.35, strokeLinejoin: 'round' }),
        h('path', { d: 'M2.5 7.05h15', stroke: 'currentColor', strokeWidth: 1.1 }),
      )
    }

    function Panel({ t, wide = false, onBack, onOpenInMain }) {
      const [state, setState] = useState({ kind: 'checking' })
      const [collections, setCollections] = useState([])
      const [tags, setTags] = useState([])
      const [items, setItems] = useState([])
      const [query, setQuery] = useState('')
      const [tagQuery, setTagQuery] = useState('')
      const [selectedTag, setSelectedTag] = useState('')
      const [tagsCollapsed, setTagsCollapsed] = useState(false)
      const [tagError, setTagError] = useState(false)
      const [loadingTags, setLoadingTags] = useState(false)
      const [collectionKey, setCollectionKey] = useState('')
      const [collapsedCollections, setCollapsedCollections] = useState(() => new Set())
      const [sort, setSort] = useState('dateAdded')
      const [direction, setDirection] = useState('desc')
      const [total, setTotal] = useState(0)
      const [nextOffset, setNextOffset] = useState(0)
      const [hasMore, setHasMore] = useState(false)
      const [checking, setChecking] = useState(false)
      const [loadingItems, setLoadingItems] = useState(false)
      const [listError, setListError] = useState('')
      const [listRetryOptions, setListRetryOptions] = useState(null)
      const [listRevision, setListRevision] = useState(0)
      const [selectedItem, setSelectedItem] = useState(null)
      const [readerMode, setReaderMode] = useState(false)
      const [mainReaderRequest, setMainReaderRequest] = useState(null)
      const handledMainReaderRequest = useRef(0)
      const [details, setDetails] = useState(null)
      const [detailLoading, setDetailLoading] = useState(false)
      const [detailError, setDetailError] = useState(false)
      const [detailTab, setDetailTab] = useState('info')
      const detailAbort = useRef(null)
      const pdfAbort = useRef(null)
      const [selectedPdfKey, setSelectedPdfKey] = useState('')
      const [pdfStatus, setPdfStatus] = useState('idle')
      const panelButtonStyle = wide ? { ...buttonStyle, borderRadius: 'var(--dsw-radius-sm, 4px)', minHeight: 30, padding: '5px 8px' } : buttonStyle
      const panelFieldStyle = wide ? { ...fieldStyle, minHeight: 30, padding: '5px 8px', borderRadius: 'var(--dsw-radius-sm, 4px)' } : fieldStyle

      const verifyPdf = useCallback(async (itemKey, attachmentKey) => {
        pdfAbort.current?.abort()
        if (!itemKey || !attachmentKey) {
          setSelectedPdfKey('')
          setPdfStatus('idle')
          return
        }
        const controller = new AbortController()
        pdfAbort.current = controller
        setSelectedPdfKey(attachmentKey)
        setPdfStatus('checking')
        try {
          const response = await fetch(`${API}/file/${encodeURIComponent(itemKey)}/${encodeURIComponent(attachmentKey)}`, {
            cache: 'no-store',
            headers: { range: 'bytes=0-0' },
            signal: controller.signal,
          })
          if (response.status === 206 && response.headers.get('content-type') === 'application/pdf') {
            await response.body?.cancel().catch(() => {})
            if (!controller.signal.aborted) setPdfStatus('ready')
            return
          }
          let errorCode = ''
          try {
            const result = await response.json()
            errorCode = result?.error?.code ?? ''
          } catch {
            await response.body?.cancel().catch(() => {})
          }
          if (controller.signal.aborted) return
          setPdfStatus(['pdf_missing', 'pdf_not_found', 'pdf_path_rejected', 'pdf_empty'].includes(errorCode) ? 'missing' : 'error')
        } catch (error) {
          if (error?.name !== 'AbortError') setPdfStatus('error')
        }
      }, [])

      const fetchItems = useCallback(async (currentQuery, currentCollection, currentTag, currentSort, currentDirection, options = {}) => {
        const { signal, offset = 0, append = false } = options
        setLoadingItems(true)
        setListError('')
        setListRetryOptions(null)
        try {
          const params = new URLSearchParams({ limit: '50', offset: String(offset), sort: currentSort, direction: currentDirection })
          if (currentQuery.trim()) params.set('q', currentQuery.trim())
          if (currentCollection) params.set('collection', currentCollection)
          if (currentTag) params.set('tag', currentTag)
          const response = await fetch(`${API}/items?${params.toString()}`, { cache: 'no-store', signal })
          const result = await response.json()
          if (!result.ok) {
            const error = new Error(result.error?.message ?? 'Could not load items.')
            error.code = result.error?.code
            throw error
          }
          setItems((previous) => append ? [...previous, ...result.data.items] : result.data.items)
          setTotal(result.data.total)
          setHasMore(result.data.hasMore)
          setNextOffset(result.data.offset + result.data.items.length)
        } catch (error) {
          if (error?.name !== 'AbortError') {
            setListError(error?.code === 'database_busy' ? 'busy' : 'error')
            setListRetryOptions({ offset, append })
            if (!append) {
              setItems([])
              setTotal(0)
              setNextOffset(0)
              setHasMore(false)
            }
          }
        } finally {
          if (!signal?.aborted) setLoadingItems(false)
        }
      }, [])

      const fetchTags = useCallback(async (currentCollection, currentQuery, signal) => {
        setLoadingTags(true)
        setTagError(false)
        try {
          const params = new URLSearchParams()
          if (currentCollection) params.set('collection', currentCollection)
          if (currentQuery.trim()) params.set('q', currentQuery.trim())
          const response = await fetch(`${API}/tags?${params.toString()}`, { cache: 'no-store', signal })
          const result = await response.json()
          if (!result.ok) throw new Error(result.error?.message ?? 'Could not load tags.')
          setTags(result.data.tags ?? [])
        } catch (error) {
          if (error?.name !== 'AbortError') {
            setTags([])
            setTagError(true)
          }
        } finally {
          if (!signal?.aborted) setLoadingTags(false)
        }
      }, [])

      const refresh = useCallback(async (signal) => {
        setChecking(true)
        try {
          const response = await fetch(`${API}/health`, { cache: 'no-store', signal })
          const result = await response.json()
          if (!result.ok) {
            setCollections([])
            setItems([])
            setState({ kind: result.error?.code === 'database_busy' ? 'busy' : result.error?.code === 'database_missing' ? 'missing' : 'error' })
            return
          }
          const collectionResponse = await fetch(`${API}/collections`, { cache: 'no-store', signal })
          const collectionResult = await collectionResponse.json()
          if (!collectionResult.ok) {
            const error = new Error(collectionResult.error?.message ?? 'Collections are unavailable.')
            error.code = collectionResult.error?.code
            throw error
          }
          setCollections(collectionResult.data.collections ?? [])
          setState({ kind: 'ready' })
          setListRevision((revision) => revision + 1)
        } catch (error) {
          if (error?.name !== 'AbortError') {
            setCollections([])
            setState({ kind: error?.code === 'database_busy' ? 'busy' : 'error' })
          }
        } finally {
          if (!signal?.aborted) setChecking(false)
        }
      }, [])

      useEffect(() => {
        const controller = new AbortController()
        void refresh(controller.signal)
        const timer = setInterval(() => void refresh(controller.signal), 15000)
        return () => {
          controller.abort()
          clearInterval(timer)
          detailAbort.current?.abort()
          pdfAbort.current?.abort()
        }
      }, [refresh])

      useEffect(() => {
        if (state.kind !== 'ready') return undefined
        const controller = new AbortController()
        const timer = setTimeout(() => void fetchItems(query, collectionKey, selectedTag, sort, direction, { signal: controller.signal }), 250)
        return () => {
          clearTimeout(timer)
          controller.abort()
        }
      }, [state.kind, listRevision, query, collectionKey, selectedTag, sort, direction, fetchItems])

      useEffect(() => {
        if (!wide || state.kind !== 'ready') return undefined
        const controller = new AbortController()
        const timer = setTimeout(() => void fetchTags(collectionKey, tagQuery, controller.signal), 150)
        return () => {
          clearTimeout(timer)
          controller.abort()
        }
      }, [wide, state.kind, listRevision, collectionKey, tagQuery, fetchTags])

      const openItem = useCallback(async (item) => {
        detailAbort.current?.abort()
        pdfAbort.current?.abort()
        setSelectedPdfKey('')
        setPdfStatus('idle')
        const controller = new AbortController()
        detailAbort.current = controller
        setSelectedItem(item)
        setReaderMode(wide)
        setDetailTab(wide ? 'pdf' : 'info')
        setDetails(null)
        setDetailError(false)
        setDetailLoading(true)
        try {
          const response = await fetch(`${API}/items/${encodeURIComponent(item.key)}`, { cache: 'no-store', signal: controller.signal })
          const result = await response.json()
          if (!result.ok) throw new Error(result.error?.message ?? 'Item details are unavailable.')
          setDetails(result.data)
          const firstPdf = result.data.pdfAttachments?.[0]?.key ?? ''
          void verifyPdf(item.key, firstPdf)
        } catch (error) {
          if (error?.name !== 'AbortError') setDetailError(true)
        } finally {
          if (!controller.signal.aborted) setDetailLoading(false)
        }
      }, [verifyPdf, wide])

      useEffect(() => {
        if (!wide) return undefined
        const receiveRequest = (request) => setMainReaderRequest(request)
        mainReaderSubscribers.add(receiveRequest)
        if (pendingMainReaderRequest) receiveRequest(pendingMainReaderRequest)
        return () => mainReaderSubscribers.delete(receiveRequest)
      }, [wide])

      useEffect(() => {
        if (!wide || !mainReaderRequest || mainReaderRequest.id <= handledMainReaderRequest.current) return
        handledMainReaderRequest.current = mainReaderRequest.id
        if (pendingMainReaderRequest?.id === mainReaderRequest.id) pendingMainReaderRequest = null
        void openItem(mainReaderRequest.item)
      }, [wide, mainReaderRequest, openItem])

      const closeItem = useCallback(() => {
        detailAbort.current?.abort()
        pdfAbort.current?.abort()
        setReaderMode(false)
        setSelectedItem(null)
        setDetailTab('info')
        setDetails(null)
        setSelectedPdfKey('')
        setPdfStatus('idle')
        setDetailError(false)
      }, [])

      const requestFullWidthReader = useCallback((item) => {
        if (wide) {
          void openItem(item)
          return
        }
        if (onOpenInMain) onOpenInMain(item)
        else void openItem(item)
      }, [wide, onOpenInMain, openItem])

      const resetList = () => {
        setItems([])
        setTotal(0)
        setNextOffset(0)
        setHasMore(false)
        setListError('')
        setListRetryOptions(null)
      }
      const changeQuery = (value) => {
        closeItem()
        resetList()
        setQuery(value)
      }
      const changeCollection = (value) => {
        closeItem()
        resetList()
        setSelectedTag('')
        setCollectionKey(value)
      }
      const changeTag = (value) => {
        closeItem()
        resetList()
        setSelectedTag(value)
      }
      const changeSort = (value) => {
        resetList()
        setSort(value)
      }
      const toggleDirection = () => {
        resetList()
        setDirection((value) => value === 'asc' ? 'desc' : 'asc')
      }
      const sortByColumn = (value) => {
        if (sort === value) {
          toggleDirection()
          return
        }
        resetList()
        setSort(value)
        setDirection('asc')
      }
      const loadMore = () => void fetchItems(query, collectionKey, selectedTag, sort, direction, { offset: nextOffset, append: true })

      const heading = state.kind === 'checking' ? t('status.checking')
        : state.kind === 'ready' ? t('status.ready')
          : state.kind === 'missing' ? t('status.missing')
            : state.kind === 'busy' ? t('status.busy') : t('status.error')
      const hint = state.kind === 'missing' ? t('empty.hint')
        : state.kind === 'busy' ? t('busy.hint')
          : state.kind === 'error' ? t('error.hint') : ''
      const accent = state.kind === 'ready' ? 'var(--dsw-alias-state-success-primary, #26835f)'
        : state.kind === 'busy' || state.kind === 'missing' ? 'var(--dsw-alias-state-warn-primary, #b26a00)'
          : state.kind === 'error' ? 'var(--dsw-alias-state-error-primary, #b3261e)'
            : 'var(--dsw-alias-label-tertiary, GrayText)'
      const statusHint = listError === 'busy' ? t('busy.hint') : listError === 'error' ? t('item.error') : ''

      const statusIndicator = h('div', {
        className: wide ? 'zlr-status-inline' : undefined,
        role: 'status', 'aria-live': 'polite',
        style: wide ? undefined : { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 },
      },
        h('span', { 'aria-hidden': true, style: { width: wide ? 7 : 8, height: wide ? 7 : 8, borderRadius: '50%', background: accent, flex: '0 0 auto' } }),
        heading,
      )
      const header = h('header', {
        className: wide ? 'zlr-main-toolbar' : undefined,
        style: wide ? undefined : { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))' },
      },
        wide && onBack ? h('button', { type: 'button', onClick: onBack, style: panelButtonStyle, 'aria-label': t('action.backConversation') }, `‹ ${t('action.backConversation')}`) : null,
        h('span', { className: wide ? 'zlr-toolbar-mark' : undefined, style: wide ? undefined : { display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 9, color: 'var(--dsw-alias-label-primary, CanvasText)', background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12))' } }, h(ReaderIcon, { size: wide ? 17 : 20 })),
        h('div', { className: wide ? 'zlr-toolbar-title' : undefined, style: wide ? undefined : { minWidth: 0, flex: 1 } },
          h('div', { style: { fontWeight: 650, fontSize: 14, lineHeight: 1.35 } }, t('tab.title')),
          h('div', { className: wide ? 'zlr-toolbar-kicker' : undefined, style: wide ? undefined : { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, marginTop: 2, letterSpacing: '.06em' } }, 'LOCAL · READ ONLY'),
        ),
        wide ? statusIndicator : null,
        h('button', {
          type: 'button', onClick: () => void refresh(), disabled: checking,
          title: t('action.retry'), 'aria-label': t('action.retry'),
          style: { ...panelButtonStyle, cursor: checking ? 'wait' : 'pointer' },
        }, checking ? '…' : t('action.retry')),
      )

      const sortControls = h('div', { className: wide ? 'zlr-sort-controls' : undefined, style: { display: 'flex', alignItems: wide ? 'center' : 'end', gap: 8, flexWrap: 'wrap' } },
        h('label', { style: { display: 'flex', flex: '1 1 150px', flexDirection: 'column', gap: wide ? 0 : 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
          h('span', { className: wide ? 'zlr-field-label' : undefined }, t('workspace.sort')),
          h('select', { value: sort, onChange: (event) => changeSort(event.target.value), 'aria-label': t('workspace.sort'), style: panelFieldStyle },
            h('option', { value: 'dateAdded' }, t('sort.recent')),
            h('option', { value: 'title' }, t('sort.title')),
            h('option', { value: 'date' }, t('sort.date')),
            h('option', { value: 'author' }, t('sort.author')),
          ),
        ),
        h('button', {
          type: 'button', onClick: toggleDirection,
          title: direction === 'asc' ? t('sort.ascending') : t('sort.descending'),
          'aria-label': `${t('workspace.sortDirection')}: ${direction === 'asc' ? t('sort.ascending') : t('sort.descending')}`,
          style: { ...panelButtonStyle, minHeight: wide ? 30 : 34, fontSize: 15, lineHeight: 1 },
        }, direction === 'asc' ? '↑' : '↓'),
      )
      const orderedCollections = [...collections].sort((left, right) => left.path.localeCompare(right.path, undefined, { sensitivity: 'base' }))
      const collectionsByKey = new Map(orderedCollections.map((collection) => [collection.key, collection]))
      const childCounts = new Map()
      for (const collection of orderedCollections) {
        if (collection.parentKey) childCounts.set(collection.parentKey, (childCounts.get(collection.parentKey) ?? 0) + 1)
      }
      const visibleCollections = orderedCollections.filter((collection) => {
        let parentKey = collection.parentKey
        const seen = new Set()
        while (parentKey && !seen.has(parentKey)) {
          if (collapsedCollections.has(parentKey)) return false
          seen.add(parentKey)
          parentKey = collectionsByKey.get(parentKey)?.parentKey ?? null
        }
        return true
      })
      const toggleCollection = (key) => {
        const collapsing = !collapsedCollections.has(key)
        if (collapsing && collectionKey && collectionKey !== key) {
          let parentKey = collectionsByKey.get(collectionKey)?.parentKey
          const seen = new Set()
          while (parentKey && !seen.has(parentKey)) {
            if (parentKey === key) {
              changeCollection(key)
              break
            }
            seen.add(parentKey)
            parentKey = collectionsByKey.get(parentKey)?.parentKey ?? null
          }
        }
        setCollapsedCollections((current) => {
          const next = new Set(current)
          if (next.has(key)) next.delete(key)
          else next.add(key)
          return next
        })
      }
      const collectionTree = h('aside', { className: 'zlr-pane zlr-library-nav' },
        h('nav', { className: 'zlr-pane zlr-collections', 'aria-label': t('workspace.collections') },
          h('div', { style: { padding: '2px 8px 8px', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' } }, t('workspace.collections')),
          h('button', {
            type: 'button', className: 'zlr-collection-button', onClick: () => changeCollection(''),
            'aria-current': collectionKey ? undefined : 'page',
          }, h('span', { className: 'zlr-collection-name' }, h(CollectionIcon), h('span', null, t('collection.all')))),
          visibleCollections.map((collection) => {
            const hasChildren = (childCounts.get(collection.key) ?? 0) > 0
            const collapsed = collapsedCollections.has(collection.key)
            const depth = Math.max(0, Math.min(6, Number.isInteger(collection.depth) ? collection.depth : 0))
            return h('div', { key: `tree-${collection.key}`, style: { display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, paddingInlineStart: depth * 9 } },
              hasChildren ? h('button', {
                type: 'button', className: 'zlr-collection-disclosure',
                'aria-expanded': !collapsed,
                'aria-label': `${t(collapsed ? 'workspace.expandCollection' : 'workspace.collapseCollection')}: ${collection.name}`,
                title: t(collapsed ? 'workspace.expandCollection' : 'workspace.collapseCollection'),
                onClick: () => toggleCollection(collection.key),
              }, collapsed ? '›' : '⌄') : h('span', { 'aria-hidden': true, style: { flex: '0 0 22px', width: 22, height: 28 } }),
              h('button', {
                type: 'button', className: 'zlr-collection-button', onClick: () => changeCollection(collection.key),
                'aria-current': collectionKey === collection.key ? 'page' : undefined,
                title: collection.path,
                style: { width: 'auto', minWidth: 0, flex: '1 1 0' },
              },
                h('span', { className: 'zlr-collection-name', style: { minWidth: 0, flex: '1 1 0' } }, h(CollectionIcon), h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, collection.name)),
                h('span', { style: { flex: '0 0 auto', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, collection.itemCount),
              ),
            )
          }),
        ),
        h('section', { className: 'zlr-tags-panel', 'data-collapsed': tagsCollapsed ? 'true' : 'false' },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '0 4px 5px' } },
            h('strong', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' } }, t('workspace.tags')),
            selectedTag ? h('button', { type: 'button', onClick: () => changeTag(''), style: { ...panelButtonStyle, minHeight: 24, padding: '2px 6px' } }, t('workspace.allTags')) : null,
            h('button', {
              type: 'button', className: 'zlr-tag-toggle', onClick: () => setTagsCollapsed((value) => !value),
              'aria-expanded': !tagsCollapsed,
              'aria-label': t(tagsCollapsed ? 'workspace.expandTags' : 'workspace.collapseTags'),
              title: t(tagsCollapsed ? 'workspace.expandTags' : 'workspace.collapseTags'),
              style: { ...panelButtonStyle, minHeight: 24, padding: '2px 6px', border: 0 },
            }, tagsCollapsed ? '›' : '⌄'),
          ),
          tagsCollapsed ? null : h(React.Fragment, null,
            h('input', {
              type: 'search', value: tagQuery, placeholder: t('workspace.searchTags'),
              onChange: (event) => setTagQuery(event.target.value),
              'aria-label': t('workspace.searchTags'), style: { ...panelFieldStyle, minHeight: 28, padding: '4px 7px', fontSize: 11 },
            }),
            tagError ? h('div', { role: 'alert', style: { padding: 6, color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 11 } },
              t('workspace.tagError'),
              h('button', { type: 'button', onClick: () => void fetchTags(collectionKey, tagQuery), style: { ...panelButtonStyle, marginTop: 4, minHeight: 24 } }, t('action.retry')),
            ) : null,
            loadingTags && tags.length === 0 ? h('div', { role: 'status', style: { padding: 6, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, t('item.loadingList')) : null,
            !loadingTags && !tagError && tags.length === 0 ? h('div', { style: { padding: 7, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, t('workspace.noTags')) : null,
            tags.length ? h('div', { className: 'zlr-tag-list' },
              h('button', {
                type: 'button', className: 'zlr-tag-button', onClick: () => changeTag(''),
                'aria-pressed': !selectedTag,
              }, h('span', null, t('workspace.allTags'))),
              tags.map((tag) => h('button', {
                key: `tag-${tag.name}`, type: 'button', className: 'zlr-tag-button', onClick: () => changeTag(tag.name),
                'aria-pressed': selectedTag === tag.name, title: tag.name,
              }, h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, tag.name),
                h('span', { style: { flex: '0 0 auto', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10.5 } }, tag.itemCount),
              )),
            ) : null,
          ),
        ),
      )
      const sortableHeader = (label, field) => {
        const active = sort === field
        const directionLabel = direction === 'asc' ? t('sort.ascending') : t('sort.descending')
        return h('th', {
          scope: 'col', ...(active ? { 'aria-sort': direction === 'asc' ? 'ascending' : 'descending' } : {}),
        }, h('button', {
          type: 'button', className: 'zlr-column-heading', onClick: () => sortByColumn(field),
          'aria-label': active ? `${label}, ${directionLabel}` : `${t('workspace.sort')}: ${label}`,
          title: active ? `${label} · ${directionLabel}` : `${t('workspace.sort')}: ${label}`,
        }, label, active ? ` ${direction === 'asc' ? '↑' : '↓'}` : null))
      }
      const wideItemRows = items.length ? h('div', { className: 'zlr-workspace-list' },
        h('table', { className: 'zlr-table', 'aria-label': t('workspace.items') },
          h('thead', null,
            h('tr', { className: 'zlr-row--header' },
              sortableHeader(t('item.title'), 'title'),
              sortableHeader(t('item.authors'), 'author'),
              sortableHeader(t('item.date'), 'date'),
              h('th', { scope: 'col', className: 'zlr-row-type' }, t('item.type')),
              h('th', { scope: 'col', className: 'zlr-row-pdf' }, t('item.pdfShort')),
            ),
          ),
          h('tbody', null, items.map((item) => h('tr', {
            key: item.key, className: 'zlr-row--item', 'data-selected': selectedItem?.key === item.key ? 'true' : 'false',
            onClick: () => void openItem(item),
          },
            h('td', null, h('button', {
              type: 'button', className: 'zlr-row-select', onClick: (event) => { event.stopPropagation(); void openItem(item) },
              'aria-pressed': selectedItem?.key === item.key,
              'aria-label': item.title || t('item.untitled'),
              title: item.title || t('item.untitled'),
            }, item.title || t('item.untitled'))),
            h('td', null, item.authors.length ? item.authors.join(' · ') : t('item.authorUnknown')),
            h('td', null, item.date || '—'),
            h('td', { className: 'zlr-row-type' }, item.itemType || '—'),
            h('td', { className: 'zlr-row-pdf', title: item.hasPdfAttachment ? t('item.pdfAttached') : t('item.noPdf') },
              h('span', { 'aria-hidden': true }, item.hasPdfAttachment ? '●' : '—'),
              h('span', { className: 'zlr-visually-hidden' }, item.hasPdfAttachment ? t('item.pdfAttached') : t('item.noPdf')),
            ),
          ))),
        ),
      ) : null

      const listView = h(React.Fragment, null,
        h('div', { className: wide ? 'zlr-list-toolbar' : undefined, style: { display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: wide ? 8 : 10, flexWrap: wide ? 'wrap' : 'nowrap' } },
          h('label', { className: wide ? 'zlr-search-label' : undefined, style: { display: 'flex', flex: wide ? '1 1 220px' : 'initial', minWidth: wide ? 150 : 0, flexDirection: 'column', gap: wide ? 0 : 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
            h('span', { className: wide ? 'zlr-field-label' : undefined }, t('search.label')),
            h('input', {
              type: 'search', value: query, placeholder: t('search.placeholder'), onChange: (event) => changeQuery(event.target.value),
              'aria-label': t('search.label'), style: panelFieldStyle,
            }),
          ),
          h('label', { className: 'zlr-collection-filter', style: wide ? undefined : { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
            h('span', { className: wide ? 'zlr-field-label' : undefined }, t('collection.label')),
            h('select', { value: collectionKey, onChange: (event) => changeCollection(event.target.value), 'aria-label': t('collection.label'), style: panelFieldStyle },
              h('option', { value: '' }, t('collection.all')),
              collections.map((collection) => h('option', { key: collection.key, value: collection.key }, `${collection.path} · ${collection.itemCount}`)),
            ),
          ),
          sortControls,
        ),
        statusHint ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5 } },
          h('span', null, statusHint),
          h('button', { type: 'button', onClick: () => void fetchItems(query, collectionKey, selectedTag, sort, direction, listRetryOptions ?? {}), disabled: loadingItems, style: panelButtonStyle }, t('action.retryList')),
        ) : null,
        h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 } },
          h('h2', { style: { margin: 0, fontSize: 12, letterSpacing: '.02em', fontWeight: 650 } }, t('workspace.items')),
          h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, `${total} ${t('item.countSuffix')}`),
        ),
        loadingItems && items.length === 0 ? h('div', { role: 'status', style: { padding: 14, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loadingList')) : null,
        !loadingItems && items.length === 0 ? h('div', { style: { padding: '18px 12px', border: '1px dashed var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: 9, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5, textAlign: 'center' } }, query || collectionKey || selectedTag ? t('item.noResults') : t('item.emptyLibrary')) : null,
        items.length ? (wide ? wideItemRows : h('div', { style: { overflowY: 'auto', minHeight: 0, flex: 1, margin: '0 -4px' } }, items.map((item) => h('button', {
          key: item.key, type: 'button', onClick: () => void openItem(item),
          style: { display: 'block', width: '100%', padding: '10px 8px', textAlign: 'left', border: 0, borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))', background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit' },
        },
          h('span', { style: { display: 'block', fontSize: 12, lineHeight: 1.45, fontWeight: 600, color: 'var(--dsw-alias-label-primary, CanvasText)' } }, item.title || t('item.untitled')),
          h('span', { style: { display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10.5, lineHeight: 1.4 } },
            h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.authors.length ? item.authors.join(' · ') : t('item.authorUnknown')),
            h('span', { style: { flex: '0 0 auto' } }, item.date),
          ),
          h('span', { style: { display: 'block', marginTop: 5, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10 } }, item.hasPdfAttachment ? t('item.pdfAttached') : t('item.noPdf')),
        )))) : null,
        hasMore ? h('button', { type: 'button', onClick: loadMore, disabled: loadingItems, style: { ...panelButtonStyle, alignSelf: 'center', marginTop: 4, opacity: loadingItems ? .6 : 1 } }, loadingItems ? t('item.loadingList') : t('action.loadMore')) : null,
      )

      const detailHeader = details ? h('div', null,
        h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 11, marginBottom: 5 } }, t('item.detail')),
        h('h2', { style: { margin: 0, fontSize: wide ? 14 : 16, lineHeight: 1.35, fontWeight: 600, overflowWrap: 'anywhere' } }, details.title || t('item.untitled')),
        h('div', { style: { marginTop: 6, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.45 } }, details.authors.length ? details.authors.join(' · ') : t('item.authorUnknown')),
        details.date ? h('div', { style: { marginTop: 3, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 12 } }, details.date) : null,
      ) : null
      const infoContent = details ? h(React.Fragment, null,
        details.publicationTitle || details.doi ? h('dl', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 10px', margin: 0, padding: '9px 0', borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))', borderBottom: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))', fontSize: 12 } },
          details.publicationTitle ? [h('dt', { key: 'journal-label', style: { color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, t('item.journal')), h('dd', { key: 'journal-value', style: { margin: 0, overflowWrap: 'anywhere' } }, details.publicationTitle)] : null,
          details.doi ? [h('dt', { key: 'doi-label', style: { color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, t('item.doi')), h('dd', { key: 'doi-value', style: { margin: 0, overflowWrap: 'anywhere' } }, details.doi)] : null,
        ) : null,
        h('section', null,
          h('h3', { style: { margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.abstract')),
          h('p', { style: { margin: 0, fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, details.abstract || t('item.noAbstract')),
        ),
        details.tags.length ? h('section', null,
          h('h3', { style: { margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.tags')),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5 } }, details.tags.map((tag) => h('span', { key: tag, style: { border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: 4, padding: '3px 7px', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11 } }, tag))),
        ) : null,
        details.collections.length ? h('section', null,
          h('h3', { style: { margin: '0 0 5px', fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.collections')),
          h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 12, lineHeight: 1.5 } }, details.collections.map((collection) => collection.name).join(' · ')),
        ) : null,
      ) : null
      const pdfContent = details ? h('section', { className: wide ? 'zlr-pdf-view' : undefined, style: wide ? undefined : { display: 'flex', flexDirection: 'column', gap: 7 } },
        h('h3', { style: { margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.pdfHeading')),
        details.pdfAttachments?.length ? h(React.Fragment, null,
          details.pdfAttachments.length > 1 ? h('label', { style: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
            t('item.pdfSelect'),
            h('select', {
              value: selectedPdfKey,
              onChange: (event) => void verifyPdf(details.key, event.target.value),
              'aria-label': t('item.pdfSelect'),
              style: panelFieldStyle,
            }, details.pdfAttachments.map((attachment, index) => h('option', { key: attachment.key, value: attachment.key }, `${t('item.pdfLabel')} ${index + 1}${attachment.dateAdded ? ` · ${attachment.dateAdded.slice(0, 10)}` : ''}`))),
          ) : null,
          pdfStatus === 'checking' ? h('div', { role: 'status', style: { color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.pdfChecking')) : null,
          pdfStatus === 'missing' ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-state-warn-primary, #b26a00)', fontSize: 12, lineHeight: 1.5 } },
            h('span', null, t('item.pdfMissing')),
            h('button', { type: 'button', onClick: () => void verifyPdf(details.key, selectedPdfKey), style: panelButtonStyle }, t('action.retryPdf')),
          ) : null,
          pdfStatus === 'error' ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 12, lineHeight: 1.5 } },
            h('span', null, t('item.pdfError')),
            h('button', { type: 'button', onClick: () => void verifyPdf(details.key, selectedPdfKey), style: panelButtonStyle }, t('action.retryPdf')),
          ) : null,
          pdfStatus === 'ready' && selectedPdfKey ? h('iframe', {
            key: `${details.key}-${selectedPdfKey}`,
            src: `${API}/file/${encodeURIComponent(details.key)}/${encodeURIComponent(selectedPdfKey)}`,
            title: t('item.pdfViewerTitle'),
            loading: 'lazy',
            referrerPolicy: 'no-referrer',
            onError: () => setPdfStatus('error'),
            style: { display: 'block', width: '100%', height: wide ? '100%' : '58vh', minHeight: wide ? 0 : 360, flex: wide ? '1 1 auto' : undefined, border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: wide ? 4 : 8, background: 'var(--dsw-alias-bg-layer-1, transparent)' },
          }) : null,
        ) : h('div', { style: { padding: 10, borderRadius: wide ? 4 : 8, background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.1))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5 } }, details.hasPdfAttachment ? t('item.pdfMissing') : t('item.noPdf')),
      ) : null
      const detailView = wide
        ? h('article', { className: 'zlr-detail-view' },
          h('div', { className: 'zlr-reader-topline' },
            h('button', { type: 'button', onClick: () => setReaderMode(false), style: panelButtonStyle }, `‹ ${t('action.backToLibrary')}`),
            h('div', { style: { minWidth: 0, flex: 1 } },
              h('div', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 650 } }, details?.title || selectedItem?.title || t('item.untitled')),
              h('div', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, (details?.authors?.length ? details.authors : selectedItem?.authors ?? []).join(' · ') || t('item.authorUnknown')),
            ),
          ),
          detailLoading ? h('div', { role: 'status', style: { padding: 12, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loading')) : null,
          detailError ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 12, color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 12 } },
            h('span', null, t('item.detailError')),
            selectedItem ? h('button', { type: 'button', onClick: () => void openItem(selectedItem), style: panelButtonStyle }, t('action.retryDetail')) : null,
          ) : null,
          details ? h(React.Fragment, null,
            h('div', { className: 'zlr-detail-tabs', role: 'group', 'aria-label': t('item.detail') },
              h('button', { type: 'button', className: 'zlr-detail-tab', 'aria-pressed': detailTab === 'info', onClick: () => setDetailTab('info') }, t('workspace.infoTab')),
              h('button', { type: 'button', className: 'zlr-detail-tab', 'aria-pressed': detailTab === 'pdf', onClick: () => setDetailTab('pdf') }, `${t('workspace.pdfTab')}${details.pdfAttachments?.length ? ` · ${details.pdfAttachments.length}` : ''}`),
            ),
            h('div', { className: 'zlr-reader-body', role: 'region', 'aria-label': detailTab === 'info' ? t('workspace.infoTab') : t('workspace.pdfTab') },
              detailTab === 'info'
                ? h('div', { className: 'zlr-reader-info' }, infoContent)
                : h('div', { className: 'zlr-reader-pdf' }, pdfContent),
            ),
          ) : null,
        )
        : h(React.Fragment, null,
          h('button', { type: 'button', onClick: closeItem, style: { ...panelButtonStyle, alignSelf: 'flex-start' } }, `‹ ${t('action.back')}`),
          detailLoading ? h('div', { role: 'status', style: { padding: 16, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loading')) : null,
          detailError ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 12 } },
            h('span', null, t('item.detailError')),
            selectedItem ? h('button', { type: 'button', onClick: () => void openItem(selectedItem), style: panelButtonStyle }, t('action.retryDetail')) : null,
          ) : null,
          details ? h('article', { style: { display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', minHeight: 0 } },
            detailHeader, infoContent,
            details.pdfAttachments?.length ? h('button', { type: 'button', onClick: () => requestFullWidthReader(selectedItem), style: { ...panelButtonStyle, alignSelf: 'flex-start' } }, t('action.openFullReader')) : h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 12 } }, t('reader.emptyPdf')),
          ) : null,
        )

      return h('section', {
        className: wide ? 'zlr-panel--wide' : undefined,
        style: {
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: wide ? 0 : 12,
          height: '100%', minHeight: wide ? 0 : 240, padding: wide ? 0 : 14,
          overflow: wide ? 'hidden' : undefined,
          color: 'var(--dsw-alias-label-primary, CanvasText)',
          background: 'var(--dsw-alias-bg-layer-1, transparent)', font: 'inherit',
        },
      },
        wide ? h('style', null, workspaceCss) : null,
        header,
        wide ? null : statusIndicator,
        hint ? h('div', {
          className: wide ? 'zlr-status-hint' : undefined,
          style: wide
            ? { margin: '8px 10px 0', padding: '7px 9px', borderRadius: 'var(--dsw-radius-sm, 4px)', border: '0.5px solid var(--dsw-alias-border-l3)', color: 'var(--dsw-alias-label-secondary)', fontSize: 11, lineHeight: 1.45 }
            : { padding: 10, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11, lineHeight: 1.5 },
        }, hint) : null,
        state.kind === 'ready' ? wide
          ? readerMode && selectedItem
            ? detailView
            : h('div', { className: 'zlr-library-grid' },
              collectionTree,
              h('section', { className: 'zlr-pane zlr-list-pane' }, listView),
            )
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, flex: 1 } }, selectedItem ? detailView : listView)
          : null,
        h('footer', { style: { display: wide ? 'none' : undefined, marginTop: 'auto', paddingTop: 9, borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10.5 } }, t('footer.local')),
      )
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs', 'layout'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, dictionaries), 'zotero-local-reader: locale')
        const t = ctx.locale.bind(NS)
        const openInMain = (item) => {
          requestMainReader(item)
          ctx.layout.selectPanel('zotero-local-reader')
        }
        ctx.effect(() => ctx.sidebarRightTabs.register({
          id: 'zotero-local-reader',
          kind: 'zotero-local-reader',
          title: () => t('tab.title'),
          guide: [{
            id: 'zotero-local-reader',
            title: () => t('guide.title'),
            description: () => t('guide.description'),
            order: 12,
            icon: ReaderIcon,
          }],
        }), 'zotero-local-reader: sidebar tab')
        ctx.slots.inject('sidebar.right.pane.tab', () => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: 'zotero-local-reader',
        }, () => h(Panel, { t, onOpenInMain: openInMain })))
        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'zotero-local-reader',
          locale: NS,
          inject: () => ({ t, wide: true, onBack: () => ctx.layout.selectPanel(null) }),
        }, Panel))
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'zotero-local-reader',
          order: 12,
          label: () => t('tab.title'),
          locale: NS,
        }, ReaderIcon))
      },
    }
  },
})
