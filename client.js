window.__ModuleLoader__.load({
  id: '@local/zotero-local-reader',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useState } = React
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
        'collection.heading': '文库目录',
        'collection.countSuffix': '篇',
        'collection.empty': '本地文库中还没有集合。',
        'collection.next': '条目搜索即将加入。',
        'action.retry': '重新检查',
        'empty.hint': '确认 Zotero 数据目录，或在插件设置中配置数据目录。',
        'busy.hint': '等待片刻后重试；读取器不会修改数据库。',
        'error.hint': '检查数据目录和 Zotero 数据库版本后重试。',
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
        'collection.heading': 'Collections',
        'collection.countSuffix': 'items',
        'collection.empty': 'There are no collections in this local library yet.',
        'collection.next': 'Item search is coming next.',
        'action.retry': 'Check again',
        'empty.hint': 'Confirm the Zotero data directory or set it in plugin settings.',
        'busy.hint': 'Wait briefly and retry. The reader never writes to the database.',
        'error.hint': 'Check the data directory and Zotero database version, then retry.',
      },
    }

    function ReaderIcon({ size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: 'M4 5.5c2.7-.9 5.3-.6 8 1v13c-2.7-1.6-5.3-1.9-8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M20 5.5c-2.7-.9-5.3-.6-8 1v13c2.7-1.6 5.3-1.9 8-1V5.5Z', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round' }),
        h('path', { d: 'M7 9h2.5M7 12h2.5m5-3H17m-2.5 3H17', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round' }),
      )
    }

    function Panel({ t }) {
      const [state, setState] = useState({ kind: 'checking', message: '' })
      const [collections, setCollections] = useState([])
      const [checking, setChecking] = useState(false)
      const refresh = useCallback(async (signal) => {
        setChecking(true)
        try {
          const response = await fetch(`${API}/health`, { cache: 'no-store', signal })
          const result = await response.json()
          if (result.ok) {
            const collectionResponse = await fetch(`${API}/collections`, { cache: 'no-store', signal })
            const collectionResult = await collectionResponse.json()
            if (!collectionResult.ok) {
              const error = new Error(collectionResult.error?.message ?? 'Collections are unavailable.')
              error.code = collectionResult.error?.code ?? 'collections_unavailable'
              throw error
            }
            setCollections(collectionResult.data.collections ?? [])
            setState({ kind: 'ready', message: '' })
          } else {
            setCollections([])
            setState({ kind: result.error?.code === 'database_busy' ? 'busy' : result.error?.code === 'database_missing' ? 'missing' : 'error', message: result.error?.message ?? '' })
          }
        } catch (error) {
          if (error?.name !== 'AbortError') {
            setCollections([])
            setState({ kind: error?.code === 'database_busy' ? 'busy' : 'error', message: '' })
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
        }
      }, [refresh])

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

      return h('section', {
        style: {
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          height: '100%',
          minHeight: 240,
          padding: 16,
          color: 'var(--dsw-alias-label-primary, CanvasText)',
          background: 'var(--dsw-alias-bg-layer-1, transparent)',
          font: 'inherit',
        },
      },
        h('header', { style: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))' } },
          h('span', { style: { display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 9, color: 'var(--dsw-alias-label-primary, CanvasText)', background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.12))' } }, h(ReaderIcon, { size: 20 })),
          h('div', { style: { minWidth: 0, flex: 1 } },
            h('div', { style: { fontWeight: 650, fontSize: 14, lineHeight: 1.35 } }, t('tab.title')),
            h('div', { style: { color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11, marginTop: 2 } }, 'LOCAL · READ ONLY'),
          ),
          h('button', {
            type: 'button',
            onClick: () => void refresh(),
            disabled: checking,
            title: t('action.retry'),
            'aria-label': t('action.retry'),
            style: { border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', background: 'transparent', color: 'inherit', borderRadius: 7, padding: '6px 9px', cursor: checking ? 'wait' : 'pointer', font: 'inherit', fontSize: 12 },
          }, checking ? '…' : t('action.retry')),
        ),
        h('div', { role: 'status', 'aria-live': 'polite', style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 } },
          h('span', { 'aria-hidden': true, style: { width: 8, height: 8, borderRadius: '50%', background: accent, flex: '0 0 auto' } }),
          heading,
        ),
        hint ? h('div', { style: { padding: 12, borderRadius: 9, border: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.55 } }, hint) : null,
        state.kind === 'ready' ? h('div', { style: { minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 } },
          h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 } },
            h('h2', { style: { margin: 0, fontSize: 12, letterSpacing: '.02em', fontWeight: 650 } }, t('collection.heading')),
            h('span', { style: { fontSize: 11, color: 'var(--dsw-alias-label-tertiary, GrayText)' } }, String(collections.length)),
          ),
          collections.length ? h('ul', { style: { listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto', minHeight: 0 } }, collections.map((collection) => h('li', { key: collection.key, style: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 8px', borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.25))' } },
            h('span', { style: { minWidth: 0, color: 'var(--dsw-alias-label-primary, CanvasText)', fontSize: 12, lineHeight: 1.45, overflowWrap: 'anywhere' }, title: collection.path }, collection.path),
            h('span', { style: { flex: '0 0 auto', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, `${collection.itemCount} ${t('collection.countSuffix')}`),
          ))) : h('div', { style: { padding: '14px 10px', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 12, lineHeight: 1.5 } }, t('collection.empty')),
          h('div', { style: { padding: '9px 10px', borderRadius: 8, background: 'var(--dsw-alias-bg-layer-2, rgba(128,128,128,.1))', color: 'var(--dsw-alias-label-secondary, GrayText)', fontSize: 11, lineHeight: 1.45 } }, t('collection.next')),
        ) : null,
        h('footer', { style: { marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--dsw-alias-border-l3, rgba(128,128,128,.35))', color: 'var(--dsw-alias-label-tertiary, GrayText)', fontSize: 11 } }, 'Zotero desktop can remain closed. No cloud API or credentials are used.'),
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
        ctx.effect(() => ctx.slots.register({
          name: 'sidebar.right.pane.tab',
          key: 'zotero-local-reader',
        }, () => h(Panel, { t })), 'zotero-local-reader: sidebar panel')
      },
    }
  },
})
