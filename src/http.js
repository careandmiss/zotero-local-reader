import { getLibraryHealth } from './zotero-db.js'

export const API_PREFIX = '/dsh-zotero-local/api'

function isLoopbackHost(hostHeader) {
  if (typeof hostHeader !== 'string' || hostHeader.length === 0) return false
  const host = hostHeader.replace(/:\d+$/u, '').toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'
}

export function isTrusted(req) {
  const host = req.headers?.host
  if (!isLoopbackHost(host)) return false
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
    if (route !== '/health') {
      sendError(res, 404, 'not_found', 'Unknown endpoint.')
      return
    }

    const data = getLibraryHealth(getConfig())
    const status = data.state === 'ready' ? 200 : data.state === 'busy' ? 503 : data.state === 'missing' ? 404 : 409
    sendJson(res, status, data.state === 'ready'
      ? { ok: true, data }
      : { ok: false, error: { code: data.code, message: data.message } })
  }
}
