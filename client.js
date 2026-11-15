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
        'guide.description': '在 DSH 侧栏浏览本机 Zotero 文献。',
        'status.checking': '正在检查本地文库…',
        'status.ready': '本地文库已连接',
        'status.missing': '未找到 Zotero 数据库',
        'status.busy': 'Zotero 正在同步或索引',
        'status.error': '无法读取 Zotero 数据库',
        'action.retry': '重新检查',
        'action.back': '返回文献列表',
        'action.loadMore': '加载更多',
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
        'item.pdfNext': 'PDF 阅读区将在下一阶段加入。',
        'item.countSuffix': '篇',
        'item.detail': '文献详情',
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
        'guide.description': 'Browse local Zotero papers in the DSH sidebar.',
        'status.checking': 'Checking the local library…',
        'status.ready': 'Local library connected',
        'status.missing': 'Zotero database not found',
        'status.busy': 'Zotero is syncing or indexing',
        'status.error': 'Could not read the Zotero database',
        'action.retry': 'Check again',
        'action.back': 'Back to papers',
        'action.loadMore': 'Load more',
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
        'item.pdfNext': 'The PDF reader arrives in the next build stage.',
        'item.countSuffix': 'items',
        'item.detail': 'Item details',
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

    function ReaderIcon({ size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 5.5c2.7-.9 5.3-.6 8 1v13c-2.7-1.6-5.3-1.9-8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M20 5.5c-2.7-.9-5.3-.6-8 1v13c2.7-1.6 5.3-1.9 8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M7 9h2.5M7 12h2.5m5-3H17m-2.5 3H17', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      )
    }

    function Panel({ t }) {
      const [state, setState] = useState({ kind: 'checking' })
      const [collections, setCollections] = useState([])
      const [items, setItems] = useState([])
      const [query, setQuery] = useState('')
      const [collectionKey, setCollectionKey] = useState('')
      const [total, setTotal] = useState(0)
      const [nextOffset, setNextOffset] = useState(0)
      const [hasMore, setHasMore] = useState(false)
      const [checking, setChecking] = useState(false)
      const [loadingItems, setLoadingItems] = useState(false)
      const [listError, setListError] = useState('')
      const [listRevision, setListRevision] = useState(0)
      const [selectedItem, setSelectedItem] = useState(null)
      const [details, setDetails] = useState(null)
      const [detailLoading, setDetailLoading] = useState(false)
      const [detailError, setDetailError] = useState(false)
      const detailAbort = useRef(null)

      const fetchItems = useCallback(async (currentQuery, currentCollection, options = {}) => {
        const { signal, offset = 0, append = false } = options
        setLoadingItems(true)
        setListError('')
        try {
          const params = new URLSearchParams({ limit: '50', offset: String(offset) })
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
            if (!append) setItems([])
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
        }
      }, [refresh])

      useEffect(() => {
        if (state.kind !== 'ready') return undefined
        const controller = new AbortController()
        const timer = setTimeout(() => void fetchItems(query, collectionKey, { signal: controller.signal }), 250)
        return () => {
          clearTimeout(timer)
          controller.abort()
        }
      }, [state.kind, listRevision, query, collectionKey, fetchItems])

      const openItem = useCallback(async (item) => {
        detailAbort.current?.abort()
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
        } catch (error) {
          if (error?.name !== 'AbortError') setDetailError(true)
        } finally {
          if (!controller.signal.aborted) setDetailLoading(false)
        }
      }, [])

      const closeItem = useCallback(() => {
        detailAbort.current?.abort()
        setSelectedItem(null)
        setDetails(null)
        setDetailError(false)
      }, [])

      const resetList = () => {
        setItems([])
        setTotal(0)
        setNextOffset(0)
        setHasMore(false)
        setListError('')
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
      const loadMore = () => void fetchItems(query, collectionKey, { offset: nextOffset, append: true })

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

      const listView = h(React.Fragment, null,
        h('label', { style: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
          t('search.label'),
          h('input', {
            type: 'search', value: query, placeholder: t('search.placeholder'), onChange: (event) => changeQuery(event.target.value),
            'aria-label': t('search.label'), style: fieldStyle,
          }),
        ),
        h('label', { style: { display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: 'var(--dsw-alias-label-secondary, GrayText)' } },
          t('collection.label'),
          h('select', { value: collectionKey, onChange: (event) => changeCollection(event.target.value), 'aria-label': t('collection.label'), style: fieldStyle },
            h('option', { value: '' }, t('collection.all')),
            collections.map((collection) => h('option', { key: collection.key, value: collection.key }, `${collection.path} · ${collection.itemCount}`)),
          ),
        ),
        statusHint ? h('div', { role: 'alert', style: { color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5 } }, statusHint) : null,
        h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 } },
          h('h2', { style: { margin: 0, fontSize: 12, letterSpacing: '.02em', fontWeight: 650 } }, t('item.detail')),
          h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, `${total} ${t('item.countSuffix')}`),
        ),
        loadingItems && items.length === 0 ? h('div', { role: 'status', style: { padding: 14, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loadingList')) : null,
        !loadingItems && items.length === 0 ? h('div', { style: { padding: '18px 12px', border: '1px dashed var(--dsw-alias-border-l3, rgba(128,128,128,.35))', borderRadius: 9, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5, textAlign: 'center' } }, query || collectionKey ? t('item.noResults') : t('item.emptyLibrary')) : null,
        items.length ? h('div', { style: { overflowY: 'auto', minHeight: 0, flex: 1, margin: '0 -4px' } }, items.map((item) => h('button', {
          key: item.key, type: 'button', onClick: () => void openItem(item),
          style: { display: 'block', width: '100%', padding: '10px 8px', textAlign: 'left', border: 0, borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))', background: 'transparent', color: 'inherit', cursor: 'pointer', font: 'inherit' },
        },
          h('span', { style: { display: 'block', fontSize: 12, lineHeight: 1.45, fontWeight: 600, color: 'var(--dsw-alias-label-primary, CanvasText)' } }, item.title || t('item.untitled')),
          h('span', { style: { display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10.5, lineHeight: 1.4 } },
            h('span', { style: { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, item.authors.length ? item.authors.join(' · ') : t('item.authorUnknown')),
            h('span', { style: { flex: '0 0 auto' } }, item.date),
          ),
          h('span', { style: { display: 'block', marginTop: 5, color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10 } }, item.hasPdfAttachment ? t('item.pdfAttached') : t('item.noPdf')),
        ))) : null,
        hasMore ? h('button', { type: 'button', onClick: loadMore, disabled: loadingItems, style: { ...buttonStyle, alignSelf: 'center', marginTop: 4, opacity: loadingItems ? .6 : 1 } }, loadingItems ? t('item.loading') : t('action.loadMore')) : null,
      )

      const detailView = h(React.Fragment, null,
        h('button', { type: 'button', onClick: closeItem, style: { ...buttonStyle, alignSelf: 'flex-start' } }, `‹ ${t('action.back')}`),
        detailLoading ? h('div', { role: 'status', style: { padding: 16, color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12 } }, t('item.loading')) : null,
        detailError ? h('div', { role: 'alert', style: { color: 'var(--dsw-alias-state-error-primary, #b3261e)', fontSize: 12 } }, t('item.detailError')) : null,
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
          h('div', { style: { padding: 10, borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.1))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11, lineHeight: 1.5 } }, details.hasPdfAttachment ? `${t('item.pdfAttached')} · ${t('item.pdfNext')}` : t('item.noPdf')),
        ) : null,
      )

      return h('section', {
        style: {
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12,
          height: '100%', minHeight: 240, padding: 14,
          color: 'var(--dsw-alias-label-primary, CanvasText)',
          background: 'var(--dsw-alias-bg-layer-1, transparent)', font: 'inherit',
        },
      },
        header,
        h('div', { role: 'status', 'aria-live': 'polite', style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 } },
          h('span', { 'aria-hidden': true, style: { width: 8, height: 8, borderRadius: '50%', background: accent, flex: '0 0 auto' } }),
          heading,
        ),
        hint ? h('div', { style: { padding: 10, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11, lineHeight: 1.5 } }, hint) : null,
        state.kind === 'ready' ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, flex: 1 } }, selectedItem ? detailView : listView) : null,
        h('footer', { style: { marginTop: 'auto', paddingTop: 9, borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 10.5 } }, t('footer.local')),
      )
    }

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs'],
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
      },
    }
  },
})
