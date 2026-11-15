window.__ModuleLoader__.load({
  id: '@local/zotero-local-reader',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React
    const NS = 'zotero-local-reader'
    const API = '/dsh-zotero-local/api'
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
        'workspace.selectItem': '选择一篇文献以查看详情',
        'workspace.sort': '排序依据',
        'workspace.sortDirection': '排序方向',
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
        'workspace.selectItem': 'Select an item to view its details',
        'workspace.sort': 'Sort by',
        'workspace.sortDirection': 'Sort direction',
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
      .zlr-workspace-grid {
        box-sizing: border-box; display: grid; grid-template-columns: minmax(170px, 210px) minmax(0, 1.1fr) minmax(0, 1fr);
        min-height: 0; flex: 1; overflow: hidden; border: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.3)); border-radius: 12px;
        background: var(--dsw-alias-bg-layer-1, transparent);
      }
      .zlr-pane { box-sizing: border-box; display: flex; flex-direction: column; min-width: 0; min-height: 0; overflow: hidden; }
      .zlr-collections { gap: 3px; padding: 12px 8px; border-right: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25)); overflow-y: auto; }
      .zlr-list-pane { gap: 10px; padding: 12px; border-right: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25)); }
      .zlr-detail-pane { gap: 10px; padding: 14px; overflow-y: auto; }
      .zlr-collection-filter { display: flex; }
      .zlr-panel--wide .zlr-collection-filter { display: none; }
      .zlr-workspace-list { display: flex; flex: 1; flex-direction: column; min-height: 0; overflow-y: auto; margin: 0 -8px; }
      .zlr-row { display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.15fr) 62px minmax(0, .8fr) 38px; align-items: center; gap: 8px; }
      .zlr-row > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .zlr-row--header { position: sticky; top: 0; z-index: 1; padding: 9px 8px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-secondary, GrayText); font-size: 11.5px; font-weight: 650; }
      .zlr-row--item { box-sizing: border-box; width: 100%; padding: 10px 8px; border: 0; border-top: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.22)); background: transparent; color: inherit; text-align: left; cursor: pointer; font: inherit; font-size: 12px; }
      .zlr-row--item:hover, .zlr-row--item[aria-pressed='true'] { background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.1)); }
      .zlr-collection-button { box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; padding: 7px 8px; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary, GrayText); text-align: left; cursor: pointer; font: inherit; font-size: 12px; }
      .zlr-collection-button:hover, .zlr-collection-button[aria-current='page'] { background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12)); color: var(--dsw-alias-label-primary, CanvasText); }
      .zlr-collection-disclosure { box-sizing: border-box; display: grid; place-items: center; flex: 0 0 22px; width: 22px; height: 28px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-secondary, GrayText); cursor: pointer; font: inherit; font-size: 15px; }
      .zlr-collection-disclosure:hover { background: var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12)); }
      .zlr-mobile-back { display: none; }
      @media (max-width: 1180px) {
        .zlr-workspace-grid { grid-template-columns: minmax(160px, 190px) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) minmax(180px, .7fr); }
        .zlr-collections { grid-row: 1 / 3; }
        .zlr-detail-pane { grid-column: 2; grid-row: 2; border-top: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25)); }
        .zlr-row { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) 54px 60px 34px; gap: 5px; }
      }
      @media (max-width: 760px) {
        .zlr-workspace-grid { display: flex; flex-direction: column; }
        .zlr-collections { display: none; }
        .zlr-list-pane[data-selected='true'] { display: none; }
        .zlr-detail-pane[data-selected='false'] { display: none; }
        .zlr-detail-pane[data-selected='true'] { display: flex; flex: 1; }
        .zlr-list-pane { display: flex; flex: 1; }
        .zlr-mobile-back { display: inline-flex; }
        .zlr-row { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) 48px 34px; gap: 5px; }
        .zlr-row-type { display: none; }
        .zlr-panel--wide .zlr-collection-filter { display: flex; }
      }
      @container zlr-main (max-width: 950px) {
        .zlr-workspace-grid { grid-template-columns: minmax(160px, 190px) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) minmax(180px, .7fr); }
        .zlr-collections { grid-row: 1 / 3; }
        .zlr-detail-pane { grid-column: 2; grid-row: 2; border-top: 1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25)); }
        .zlr-row { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) 54px 60px 34px; gap: 5px; }
      }
      @container zlr-main (max-width: 660px) {
        .zlr-workspace-grid { display: flex; flex-direction: column; }
        .zlr-collections { display: none; }
        .zlr-list-pane[data-selected='true'] { display: none; }
        .zlr-detail-pane[data-selected='false'] { display: none; }
        .zlr-detail-pane[data-selected='true'] { display: flex; flex: 1; }
        .zlr-list-pane { display: flex; flex: 1; }
        .zlr-mobile-back { display: inline-flex; }
        .zlr-row { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr) 48px 34px; gap: 5px; }
        .zlr-row-type { display: none; }
        .zlr-panel--wide .zlr-collection-filter { display: flex; }
      }
    `

    function ReaderIcon({ size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 5.5c2.7-.9 5.3-.6 8 1v13c-2.7-1.6-5.3-1.9-8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M20 5.5c-2.7-.9-5.3-.6-8 1v13c2.7-1.6 5.3-1.9 8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M7 9h2.5M7 12h2.5m5-3H17m-2.5 3H17', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      )
    }

    function Panel({ t, wide = false, onBack }) {
      const [state, setState] = useState({ kind: 'checking' })
      const [collections, setCollections] = useState([])
      const [items, setItems] = useState([])
      const [query, setQuery] = useState('')
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
      const [details, setDetails] = useState(null)
      const [detailLoading, setDetailLoading] = useState(false)
      const [detailError, setDetailError] = useState(false)
      const detailAbort = useRef(null)
      const pdfAbort = useRef(null)
      const [selectedPdfKey, setSelectedPdfKey] = useState('')
      const [pdfStatus, setPdfStatus] = useState('idle')

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

      const fetchItems = useCallback(async (currentQuery, currentCollection, currentSort, currentDirection, options = {}) => {
        const { signal, offset = 0, append = false } = options
        setLoadingItems(true)
        setListError('')
        setListRetryOptions(null)
        try {
          const params = new URLSearchParams({ limit: '50', offset: String(offset), sort: currentSort, direction: currentDirection })
          if (currentQuery.trim()) params.set('q', currentQuery.trim())
          if (currentCollection) params.set('collection', currentCollection)
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
        const timer = setTimeout(() => void fetchItems(query, collectionKey, sort, direction, { signal: controller.signal }), 250)
        return () => {
          clearTimeout(timer)
          controller.abort()
        }
      }, [state.kind, listRevision, query, collectionKey, sort, direction, fetchItems])

      const openItem = useCallback(async (item) => {
        detailAbort.current?.abort()
        pdfAbort.current?.abort()
        setSelectedPdfKey('')
        setPdfStatus('idle')
        const controller = new AbortController()
        detailAbort.current = controller
        setSelectedItem(item)
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
      }, [verifyPdf])

      const closeItem = useCallback(() => {
        detailAbort.current?.abort()
        pdfAbort.current?.abort()
        setSelectedItem(null)
        setDetails(null)
        setSelectedPdfKey('')
        setPdfStatus('idle')
        setDetailError(false)
      }, [])

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
        setCollectionKey(value)
      }
      const changeSort = (value) => {
        resetList()
        setSort(value)
      }
      const toggleDirection = () => {
        resetList()
        setDirection((value) => value === 'asc' ? 'desc' : 'asc')
      }
      const loadMore = () => void fetchItems(query, collectionKey, sort, direction, { offset: nextOffset, append: true })

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

      const header = h('header', { style: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))' } },
        wide && onBack ? h('button', { type: 'button', onClick: onBack, style: buttonStyle, 'aria-label': t('action.backConversation') }, `‹ ${t('action.backConversation')}`) : null,
        h('span', { style: { display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 9, color: 'var(--dsw-alias-label-primary, CanvasText)', background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12))' } }, h(ReaderIcon, { size: 20 })),
        h('div', { style: { minWidth: 0, flex: 1 } },
          h('div', { style: { fontWeight: 650, fontSize: 14, lineHeight: 1.35 } }, t('tab.title')),
          h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, marginTop: 2, letterSpacing: '.06em' } }, 'LOCAL · READ ONLY'),
        ),
        h('button', {
          type: 'button', onClick: () => void refresh(), disabled: checking,
          title: t('action.retry'), 'aria-label': t('action.retry'),
          style: { ...buttonStyle, cursor: checking ? 'wait' : 'pointer' },
        }, checking ? '…' : t('action.retry')),
      )

      const sortControls = h('div', { style: { display: 'flex', alignItems: 'end', gap: 8, flexWrap: 'wrap' } },
        h('label', { style: { display: 'flex', flex: '1 1 150px', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
          t('workspace.sort'),
          h('select', { value: sort, onChange: (event) => changeSort(event.target.value), 'aria-label': t('workspace.sort'), style: fieldStyle },
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
          style: { ...buttonStyle, minHeight: 34, fontSize: 15, lineHeight: 1 },
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
      const collectionTree = h('nav', { className: 'zlr-pane zlr-collections', 'aria-label': t('workspace.collections') },
        h('div', { style: { padding: '2px 8px 8px', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' } }, t('workspace.collections')),
        h('button', {
          type: 'button', className: 'zlr-collection-button', onClick: () => changeCollection(''),
          'aria-current': collectionKey ? undefined : 'page',
        }, h('span', null, t('collection.all'))),
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
              h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, collection.name),
              h('span', { style: { flex: '0 0 auto', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, collection.itemCount),
            ),
          )
        }),
      )
      const wideItemRows = items.length ? h('div', { className: 'zlr-workspace-list', role: 'list', 'aria-label': t('workspace.items') },
        h('div', { className: 'zlr-row zlr-row--header', role: 'presentation' },
          h('span', null, t('item.title')),
          h('span', null, t('item.authors')),
          h('span', null, t('item.date')),
          h('span', { className: 'zlr-row-type' }, t('item.type')),
          h('span', { className: 'zlr-row-pdf' }, t('item.pdfShort')),
        ),
        items.map((item) => h('div', { key: item.key, role: 'listitem' },
          h('button', {
            type: 'button', className: 'zlr-row zlr-row--item', onClick: () => void openItem(item),
            'aria-pressed': selectedItem?.key === item.key,
            'aria-label': `${item.title || t('item.untitled')} · ${item.authors.length ? item.authors.join(' · ') : t('item.authorUnknown')} · ${item.date || '—'} · ${item.itemType || '—'} · ${item.hasPdfAttachment ? t('item.pdfAttached') : t('item.noPdf')}`,
            title: item.title || t('item.untitled'),
          },
            h('span', { className: 'zlr-row-title', style: { fontWeight: 620, color: 'var(--dsw-alias-label-primary, CanvasText)' } }, item.title || t('item.untitled')),
            h('span', null, item.authors.length ? item.authors.join(' · ') : t('item.authorUnknown')),
            h('span', null, item.date || '—'),
            h('span', { className: 'zlr-row-type' }, item.itemType),
            h('span', { className: 'zlr-row-pdf', title: item.hasPdfAttachment ? t('item.pdfAttached') : t('item.noPdf') }, item.hasPdfAttachment ? '●' : '—'),
          ),
        )),
      ) : null

      const listView = h(React.Fragment, null,
        h('label', { style: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
          t('search.label'),
          h('input', {
            type: 'search', value: query, placeholder: t('search.placeholder'), onChange: (event) => changeQuery(event.target.value),
            'aria-label': t('search.label'), style: fieldStyle,
          }),
        ),
        h('label', { className: 'zlr-collection-filter', style: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
          t('collection.label'),
          h('select', { value: collectionKey, onChange: (event) => changeCollection(event.target.value), 'aria-label': t('collection.label'), style: fieldStyle },
            h('option', { value: '' }, t('collection.all')),
            collections.map((collection) => h('option', { key: collection.key, value: collection.key }, `${collection.path} · ${collection.itemCount}`)),
          ),
        ),
        sortControls,
        statusHint ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5 } },
          h('span', null, statusHint),
          h('button', { type: 'button', onClick: () => void fetchItems(query, collectionKey, sort, direction, listRetryOptions ?? {}), disabled: loadingItems, style: buttonStyle }, t('action.retryList')),
        ) : null,
        h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 } },
          h('h2', { style: { margin: 0, fontSize: 12, letterSpacing: '.02em', fontWeight: 650 } }, t('workspace.items')),
          h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, `${total} ${t('item.countSuffix')}`),
        ),
        loadingItems && items.length === 0 ? h('div', { role: 'status', style: { padding: 14, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loadingList')) : null,
        !loadingItems && items.length === 0 ? h('div', { style: { padding: '18px 12px', border: '1px dashed var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: 9, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5, textAlign: 'center' } }, query || collectionKey ? t('item.noResults') : t('item.emptyLibrary')) : null,
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
        hasMore ? h('button', { type: 'button', onClick: loadMore, disabled: loadingItems, style: { ...buttonStyle, alignSelf: 'center', marginTop: 4, opacity: loadingItems ? .6 : 1 } }, loadingItems ? t('item.loadingList') : t('action.loadMore')) : null,
      )

      const detailView = h(React.Fragment, null,
        wide
          ? h('button', { type: 'button', className: 'zlr-mobile-back', onClick: closeItem, style: { ...buttonStyle, alignSelf: 'flex-start' } }, `‹ ${t('action.back')}`)
          : h('button', { type: 'button', onClick: closeItem, style: { ...buttonStyle, alignSelf: 'flex-start' } }, `‹ ${t('action.back')}`),
        detailLoading ? h('div', { role: 'status', style: { padding: 16, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loading')) : null,
        detailError ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 12 } },
          h('span', null, t('item.detailError')),
          selectedItem ? h('button', { type: 'button', onClick: () => void openItem(selectedItem), style: buttonStyle }, t('action.retryDetail')) : null,
        ) : null,
        details ? h('article', { style: { display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', minHeight: 0 } },
          h('div', null,
            h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 10, marginBottom: 6 } }, t('item.detail')),
            h('h2', { style: { margin: 0, fontSize: 16, lineHeight: 1.35, fontWeight: 650, overflowWrap: 'anywhere' } }, details.title || t('item.untitled')),
            h('div', { style: { marginTop: 7, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5 } }, details.authors.length ? details.authors.join(' · ') : t('item.authorUnknown')),
            details.date ? h('div', { style: { marginTop: 3, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, details.date) : null,
          ),
          details.publicationTitle || details.doi ? h('dl', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '5px 10px', margin: 0, padding: '9px 0', borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))', borderBottom: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))', fontSize: 11 } },
            details.publicationTitle ? [h('dt', { key: 'journal-label', style: { color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, t('item.journal')), h('dd', { key: 'journal-value', style: { margin: 0, overflowWrap: 'anywhere' } }, details.publicationTitle)] : null,
            details.doi ? [h('dt', { key: 'doi-label', style: { color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, t('item.doi')), h('dd', { key: 'doi-value', style: { margin: 0, overflowWrap: 'anywhere' } }, details.doi)] : null,
          ) : null,
          h('section', null,
            h('h3', { style: { margin: '0 0 6px', fontSize: 11, fontWeight: 650, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.abstract')),
            h('p', { style: { margin: 0, fontSize: 12, lineHeight: 1.65, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, details.abstract || t('item.noAbstract')),
          ),
          details.tags.length ? h('section', null,
            h('h3', { style: { margin: '0 0 6px', fontSize: 11, fontWeight: 650, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.tags')),
            h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5 } }, details.tags.map((tag) => h('span', { key: tag, style: { border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: 999, padding: '3px 7px', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 10 } }, tag))),
          ) : null,
          details.collections.length ? h('section', null,
            h('h3', { style: { margin: '0 0 5px', fontSize: 11, fontWeight: 650, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.collections')),
            h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, lineHeight: 1.5 } }, details.collections.map((collection) => collection.name).join(' · ')),
          ) : null,
          h('section', { style: { display: 'flex', flexDirection: 'column', gap: 7 } },
            h('h3', { style: { margin: '0 0 2px', fontSize: 11, fontWeight: 650, color: 'var(--dsw-alias-label-secondary, GrayText)' } }, t('item.pdfHeading')),
            details.pdfAttachments?.length ? h(React.Fragment, null,
              details.pdfAttachments.length > 1 ? h('label', { style: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
                t('item.pdfSelect'),
                h('select', {
                  value: selectedPdfKey,
                  onChange: (event) => void verifyPdf(details.key, event.target.value),
                  'aria-label': t('item.pdfSelect'),
                  style: fieldStyle,
                }, details.pdfAttachments.map((attachment, index) => h('option', { key: attachment.key, value: attachment.key }, `${t('item.pdfLabel')} ${index + 1}${attachment.dateAdded ? ` · ${attachment.dateAdded.slice(0, 10)}` : ''}`))),
              ) : null,
              pdfStatus === 'checking' ? h('div', { role: 'status', style: { color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11 } }, t('item.pdfChecking')) : null,
              pdfStatus === 'missing' ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-state-warn-primary, #b26a00)', fontSize: 11, lineHeight: 1.5 } },
                h('span', null, t('item.pdfMissing')),
                h('button', { type: 'button', onClick: () => void verifyPdf(details.key, selectedPdfKey), style: buttonStyle }, t('action.retryPdf')),
              ) : null,
              pdfStatus === 'error' ? h('div', { role: 'alert', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 11, lineHeight: 1.5 } },
                h('span', null, t('item.pdfError')),
                h('button', { type: 'button', onClick: () => void verifyPdf(details.key, selectedPdfKey), style: buttonStyle }, t('action.retryPdf')),
              ) : null,
              pdfStatus === 'ready' && selectedPdfKey ? h('iframe', {
                key: `${details.key}-${selectedPdfKey}`,
                src: `${API}/file/${encodeURIComponent(details.key)}/${encodeURIComponent(selectedPdfKey)}`,
                title: t('item.pdfViewerTitle'),
                loading: 'lazy',
                referrerPolicy: 'no-referrer',
                onError: () => setPdfStatus('error'),
                style: { display: 'block', width: '100%', height: '58vh', minHeight: 360, border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-1, transparent)' },
              }) : null,
            ) : h('div', { style: { padding: 10, borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.1))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11, lineHeight: 1.5 } }, details.hasPdfAttachment ? t('item.pdfMissing') : t('item.noPdf')),
          ),
        ) : null,
      )

      return h('section', {
        className: wide ? 'zlr-panel--wide' : undefined,
        style: {
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12,
          height: '100%', minHeight: wide ? 0 : 240, padding: wide ? 16 : 14,
          overflow: wide ? 'hidden' : undefined,
          color: 'var(--dsw-alias-label-primary, CanvasText)',
          background: 'var(--dsw-alias-bg-layer-1, transparent)', font: 'inherit',
        },
      },
        wide ? h('style', null, workspaceCss) : null,
        header,
        h('div', { role: 'status', 'aria-live': 'polite', style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 } },
          h('span', { 'aria-hidden': true, style: { width: 8, height: 8, borderRadius: '50%', background: accent, flex: '0 0 auto' } }),
          heading,
        ),
        hint ? h('div', { style: { padding: 10, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11, lineHeight: 1.5 } }, hint) : null,
        state.kind === 'ready' ? wide
          ? h('div', { className: 'zlr-workspace-grid' },
            collectionTree,
            h('section', { className: 'zlr-pane zlr-list-pane', 'data-selected': selectedItem ? 'true' : 'false' }, listView),
            h('section', { className: 'zlr-pane zlr-detail-pane', 'data-selected': selectedItem ? 'true' : 'false' }, selectedItem
              ? detailView
              : h('div', { role: 'status', style: { margin: 'auto', maxWidth: 240, padding: 20, textAlign: 'center', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 12, lineHeight: 1.6 } }, t('workspace.selectItem'))),
          )
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, flex: 1 } }, selectedItem ? detailView : listView)
          : null,
        h('footer', { style: { marginTop: 'auto', paddingTop: 9, borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10.5 } }, t('footer.local')),
      )
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs', 'layout'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, dictionaries), 'zotero-local-reader: locale')
        const t = ctx.locale.bind(NS)
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
        }, () => h(Panel, { t })))
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
