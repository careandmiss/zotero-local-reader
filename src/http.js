import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import { extname, isAbsolute, relative, sep } from 'node:path'
import {
  findPdfForItem,
  getItemDetails,
  getLibraryHealth,
  listCollections,
  listItems,
  listTags,
  LIST_SORT_DIRECTIONS,
  LIST_SORT_FIELDS,
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

function parseEnumParameter(value, allowed, fallback, label) {
  if (value === null) return fallback
  if (!allowed.includes(value)) throw new ZoteroReadError('bad_request', `Invalid ${label}.`)
  return value
}

function errorStatus(code) {
  if (code === 'bad_request') return 400
  if (code === 'database_missing' || code === 'pdf_not_found' || code === 'pdf_missing') return 404
  if (code === 'database_busy') return 503
  if (code === 'schema_unsupported' || code === 'database_invalid') return 409
  return 500
}

function reportOperationError(res, error, fallback) {
  const code = error?.code ?? 'database_unavailable'
  const message = error instanceof ZoteroReadError ? error.message : fallback
  sendError(res, errorStatus(code), code, message)
}

function parseRange(header, size) {
  if (header === undefined) return null
  if (typeof header !== 'string' || size <= 0 || header.includes(',')) return { invalid: true }
  const match = /^bytes=(\d*)-(\d*)$/u.exec(header.trim())
  if (!match || (!match[1] && !match[2])) return { invalid: true }
  let start
  let end
  if (!match[1]) {
    const suffix = Number(match[2])
    if (!Number.isSafeInteger(suffix) || suffix <= 0) return { invalid: true }
    start = Math.max(0, size - suffix)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] ? Number(match[2]) : size - 1
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= size) return { invalid: true }
    end = Math.min(end, size - 1)
  }
  return { start, end }
}

function isContained(root, file) {
  const pathFromRoot = relative(root, file)
  return pathFromRoot !== '' && pathFromRoot !== '..' && !pathFromRoot.startsWith(`..${sep}`) && !isAbsolute(pathFromRoot)
}

async function servePdf(req, res, config, parentKey, attachmentKey) {
  let resolved
  try {
    resolved = findPdfForItem(config, parentKey, attachmentKey)
  } catch (error) {
    reportOperationError(res, error, 'Could not resolve this local Zotero PDF.')
    return
  }
  if (!resolved) {
    sendError(res, 404, 'pdf_not_found', 'No Zotero-managed PDF attachment was found for this item.')
    return
  }

  let root
  let file
  let info
  try {
    root = await realpath(resolved.storageRoot)
    file = await realpath(resolved.filePath)
    info = await stat(file)
  } catch {
    sendError(res, 404, 'pdf_missing', 'The PDF attachment is missing from local Zotero storage.')
    return
  }
  if (!info.isFile() || extname(file).toLowerCase() !== '.pdf' || !isContained(root, file)) {
    sendError(res, 403, 'pdf_path_rejected', 'The attachment is outside the supported Zotero storage area.')
    return
  }
  if (info.size === 0) {
    sendError(res, 422, 'pdf_empty', 'The local PDF attachment is empty.')
    return
  }

  const range = parseRange(req.headers.range, info.size)
  if (range?.invalid) {
    res.writeHead(416, {
      'content-range': `bytes */${info.size}`,
      'accept-ranges': 'bytes',
      'cache-control': 'no-store',
      'cross-origin-resource-policy': 'same-origin',
      'x-content-type-options': 'nosniff',
    })
    res.end()
    return
  }

  const start = range?.start ?? 0
  const end = range?.end ?? info.size - 1
  const headers = {
    'content-type': 'application/pdf',
    'content-length': end - start + 1,
    'accept-ranges': 'bytes',
    'cache-control': 'no-store',
    'content-disposition': 'inline; filename="zotero-paper.pdf"',
    'cross-origin-resource-policy': 'same-origin',
    'x-content-type-options': 'nosniff',
  }
  if (range) headers['content-range'] = `bytes ${start}-${end}/${info.size}`
  res.writeHead(range ? 206 : 200, headers)
  const stream = createReadStream(file, { start, end })
  stream.on('error', () => {
    if (res.headersSent) res.destroy()
    else sendError(res, 500, 'pdf_read_failed', 'Could not read the local PDF attachment.')
  })
  stream.pipe(res)
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

    if (route === '/tags') {
      try {
        const query = url.searchParams.get('q') ?? ''
        const collectionKey = url.searchParams.get('collection') ?? null
        const tags = listTags(config, { query, collectionKey })
        sendJson(res, 200, { ok: true, data: { tags } })
      } catch (error) {
        reportOperationError(res, error, 'Could not read Zotero tags.')
      }
      return
    }

    if (route === '/items') {
      try {
        const query = url.searchParams.get('q') ?? ''
        const collectionKey = url.searchParams.get('collection') ?? null
        const tag = url.searchParams.get('tag') ?? ''
        const limit = parseIntegerParameter(url.searchParams.get('limit'), 50, 1, 100, 'page size')
        const offset = parseIntegerParameter(url.searchParams.get('offset'), 0, 0, 1_000_000, 'page offset')
        const sort = parseEnumParameter(url.searchParams.get('sort'), LIST_SORT_FIELDS, 'dateAdded', 'sort field')
        const direction = parseEnumParameter(url.searchParams.get('direction'), LIST_SORT_DIRECTIONS, 'desc', 'sort direction')
        const data = listItems(config, { query, collectionKey, tag, limit, offset, sort, direction })
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

    if (route.startsWith('/file/')) {
      const segments = route.slice('/file/'.length).split('/')
      if (segments.length !== 2 || segments.some((segment) => segment.length === 0)) {
        sendError(res, 400, 'bad_request', 'A parent item key and attachment key are required.')
        return
      }
      let parentKey
      let attachmentKey
      try {
        parentKey = decodeURIComponent(segments[0])
        attachmentKey = decodeURIComponent(segments[1])
      } catch {
        sendError(res, 400, 'bad_request', 'Invalid Zotero item or attachment key.')
        return
      }
      await servePdf(req, res, config, parentKey, attachmentKey)
      return
    }

    sendError(res, 404, 'not_found', 'Unknown endpoint.')
  }
}
