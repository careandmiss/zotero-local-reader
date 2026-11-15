import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createHandler, isTrusted } from '../src/http.js'
import { makeLibrary } from './helpers/fixture.js'

async function withServer(handler, run) {
  const server = createServer(handler)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  try {
    await run(`http://127.0.0.1:${address.port}`)
  } finally {
    server.close()
    await once(server, 'close')
  }
}

test('health endpoint gives actionable missing-library state', async () => {
  const handler = createHandler({ getConfig: () => ({ dataDir: 'Z:/no-such-zotero-library' }) })
  await withServer(handler, async (base) => {
    const response = await fetch(`${base}/dsh-zotero-local/api/health`)
    const body = await response.json()
    assert.equal(response.status, 404)
    assert.equal(response.headers.get('access-control-allow-origin'), null)
    assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin')
    assert.equal(body.ok, false)
    assert.equal(body.error.code, 'database_missing')
  })
})

test('collections endpoint returns only local collection metadata', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const response = await fetch(`${base}/dsh-zotero-local/api/collections`)
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.ok, true)
    assert.equal(body.data.collections.length, 2)
    assert.equal(body.data.collections.some((item) => JSON.stringify(item).includes(library.dataDir)), false)
  })
})

test('item search and detail routes return only requested metadata', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const response = await fetch(`${base}/dsh-zotero-local/api/items?q=Example&limit=10`)
    const body = await response.json()
    assert.equal(response.status, 200)
    assert.equal(body.data.total, 1)
    assert.equal(body.data.items[0].key, 'PAPER001')
    assert.equal(Object.hasOwn(body.data.items[0], 'abstract'), false)

    const detailResponse = await fetch(`${base}/dsh-zotero-local/api/items/PAPER001`)
    const detail = await detailResponse.json()
    assert.equal(detailResponse.status, 200)
    assert.equal(detail.data.abstract, 'Synthetic abstract only; no real paper content.')
    assert.equal(JSON.stringify(detail).includes(library.dataDir), false)
  })
})

test('item route rejects invalid keys and oversized page sizes', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const invalidKey = await fetch(`${base}/dsh-zotero-local/api/items/not-a-key`)
    assert.equal(invalidKey.status, 400)
    const malformedKey = await fetch(`${base}/dsh-zotero-local/api/items/%E0%A4%A`)
    assert.equal(malformedKey.status, 400)
    const oversized = await fetch(`${base}/dsh-zotero-local/api/items?limit=101`)
    assert.equal(oversized.status, 400)
  })
})

test('health endpoint rejects cross-site requests', async () => {
  const handler = createHandler({ getConfig: () => ({ dataDir: '' }) })
  await withServer(handler, async (base) => {
    const response = await fetch(`${base}/dsh-zotero-local/api/health`, { headers: { 'sec-fetch-site': 'cross-site' } })
    assert.equal(response.status, 403)
  })
})

test('loopback Host spoofing from a remote peer is rejected', () => {
  assert.equal(isTrusted({
    headers: { host: '127.0.0.1:13373', 'sec-fetch-site': 'same-origin' },
    socket: { remoteAddress: '203.0.113.10' },
  }), false)
})

test('API is GET-only and does not answer unknown paths', async () => {
  const handler = createHandler({ getConfig: () => ({ dataDir: '' }) })
  await withServer(handler, async (base) => {
    const post = await fetch(`${base}/dsh-zotero-local/api/health`, { method: 'POST' })
    assert.equal(post.status, 405)
    const unknown = await fetch(`${base}/dsh-zotero-local/api/private`)
    assert.equal(unknown.status, 404)
  })
})
