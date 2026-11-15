import {
  getItemDetails,
  getLibraryHealth,
  listCollections,
  listItems,
  ZoteroReadError,
} from './zotero-db.js'

export const API_PREFIX = '/dsh-zotero-local/api'

function isLoopbackHost(hostHeader) {
  if (typeof hostHeader !== 'string' || hostHeader.length === 0) return false
  const host = hostHeader.replace(/:\d+$/u, '').toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'
}

function isLoopbackAddress(address) {
  if (typeof address !== 'string') return false
  const normalized = address.toLowerCase()
  return normalized === '127.0.0.1' || normalized === '::1' || normalized === '::ffff:127.0.0.1'
}

export function isTrusted(req) {
  const host = req.headers?.host
  if (!isLoopbackHost(host) || !isLoopbackAddress(req.socket?.remoteAddress)) return false
  const site = req.headers?.['sec-fetch-site']
  if (typeof site === 'string' && site.toLowerCase() !== 'same-origin') return false
  const origin = req.headers?.origin
  if (typeof origin === 'string') {
    try {
      const originUrl = new URL(origin)
      if (originUrl.host.toLowerCase() !== String(host).toLowerCase()) return false
    } catch {
      return false
    }
  }
  return true
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': Buffer.byteLength(body),
    'cross-origin-resource-policy': 'same-origin',
    'x-content-type-options': 'nosniff',
  })
  res.end(body)
}

function sendError(res, status, code, message) {
  sendJson(res, status, { ok: false, error: { code, message } })
}

function validateRequest(req, res) {
  if (!isTrusted(req)) {
    sendError(res, 403, 'untrusted_request', 'Request rejected.')
    return false
  }
  if (req.method !== 'GET') {
    sendError(res, 405, 'method_not_allowed', 'Only GET is supported.')
    return false
  }
  return true
}

function parseIntegerParameter(value, fallback, min, max, label) {
  if (value === null) return fallback
  if (!/^(0|[1-9][0-9]*)$/u.test(value)) throw new ZoteroReadError('bad_request', `Invalid ${label}.`)
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number < min || number > max) throw new ZoteroReadError('bad_request', `Invalid ${label}.`)
  return number
}

function errorStatus(code) {
  if (code === 'bad_request') return 400
  if (code === 'database_missing') return 404
  if (code === 'database_busy') return 503
  if (code === 'schema_unsupported' || code === 'database_invalid') return 409
  return 500
}

function reportOperationError(res, error, fallback) {
  const code = error?.code ?? 'database_unavailable'
  const message = error instanceof ZoteroReadError ? error.message : fallback
  sendError(res, errorStatus(code), code, message)
}

export function createHandler({ getConfig }) {
  return async (req, res) => {
    if (!validateRequest(req, res)) return

    let url
    try {
      url = new URL(req.url ?? '/', `http://${req.headers.host ?? '127.0.0.1'}`)
    } catch {
      sendError(res, 400, 'bad_request', 'Invalid request URL.')
      return
    }
    if (!url.pathname.startsWith(`${API_PREFIX}/`)) {
      sendError(res, 404, 'not_found', 'Unknown endpoint.')
      return
    }
    const route = url.pathname.slice(API_PREFIX.length)
    const config = getConfig()

    if (route === '/health') {
      const data = getLibraryHealth(config)
      const status = data.state === 'ready' ? 200 : data.state === 'busy' ? 503 : data.state === 'missing' ? 404 : 409
      sendJson(res, status, data.state === 'ready'
        ? { ok: true, data }
        : { ok: false, error: { code: data.code, message: data.message } })
      return
    }

    if (route === '/collections') {
      try {
        sendJson(res, 200, { ok: true, data: { collections: listCollections(config) } })
      } catch (error) {
        reportOperationError(res, error, 'Could not read Zotero collections.')
      }
      return
    }

    if (route === '/items') {
      try {
        const query = url.searchParams.get('q') ?? ''
        const collectionKey = url.searchParams.get('collection') ?? null
        const limit = parseIntegerParameter(url.searchParams.get('limit'), 50, 1, 100, 'page size')
        const offset = parseIntegerParameter(url.searchParams.get('offset'), 0, 0, 1_000_000, 'page offset')
        const data = listItems(config, { query, collectionKey, limit, offset })
        sendJson(res, 200, { ok: true, data })
      } catch (error) {
        reportOperationError(res, error, 'Could not search the Zotero library.')
      }
      return
    }

    if (route.startsWith('/items/')) {
      let key
      try {
        key = decodeURIComponent(route.slice('/items/'.length))
      } catch {
        sendError(res, 400, 'bad_request', 'Invalid Zotero item key.')
        return
      }
      try {
        const item = getItemDetails(config, key)
        if (!item) {
          sendError(res, 404, 'item_not_found', 'Zotero item not found.')
          return
        }
        sendJson(res, 200, { ok: true, data: item })
      } catch (error) {
        reportOperationError(res, error, 'Could not read the Zotero item.')
      }
      return
    }

    sendError(res, 404, 'not_found', 'Unknown endpoint.')
  }
}
