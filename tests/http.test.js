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

test('tags endpoint returns collection-scoped counts and filters item lists by exact tag', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const tags = await fetch(`${base}/dsh-zotero-local/api/tags?q=syn`)
    const tagsBody = await tags.json()
    assert.equal(tags.status, 200)
    assert.deepEqual(tagsBody.data.tags, [{ name: 'Synthetic', itemCount: 2 }])

    const scoped = await fetch(`${base}/dsh-zotero-local/api/tags?collection=COLL0002`)
    assert.deepEqual((await scoped.json()).data.tags, [{ name: 'Synthetic', itemCount: 1 }])

    const filtered = await fetch(`${base}/dsh-zotero-local/api/items?tag=Synthetic`)
    assert.equal((await filtered.json()).data.total, 2)

    const invalidCollection = await fetch(`${base}/dsh-zotero-local/api/tags?collection=not-a-key`)
    assert.equal(invalidCollection.status, 400)
    const oversizedQuery = await fetch(`${base}/dsh-zotero-local/api/tags?q=${'x'.repeat(201)}`)
    assert.equal(oversizedQuery.status, 400)
    const oversizedTag = await fetch(`${base}/dsh-zotero-local/api/items?tag=${'x'.repeat(201)}`)
    assert.equal(oversizedTag.status, 400)
  })
})

test('item list route applies safe sort parameters and rejects invalid values', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const sorted = await fetch(`${base}/dsh-zotero-local/api/items?sort=title&direction=asc&limit=10`)
    const sortedBody = await sorted.json()
    assert.equal(sorted.status, 200)
    assert.deepEqual(sortedBody.data.items.map((item) => item.key), ['PAPER002', 'PAPER001'])

    const invalidSort = await fetch(`${base}/dsh-zotero-local/api/items?sort=title%20DESC%3b%20DROP%20TABLE%20items`)
    assert.equal(invalidSort.status, 400)
    assert.equal((await invalidSort.json()).error.code, 'bad_request')

    const invalidDirection = await fetch(`${base}/dsh-zotero-local/api/items?direction=sideways`)
    assert.equal(invalidDirection.status, 400)
    assert.equal((await invalidDirection.json()).error.code, 'bad_request')

    const stillReadable = await fetch(`${base}/dsh-zotero-local/api/items`)
    assert.equal(stillReadable.status, 200)
    assert.equal((await stillReadable.json()).data.total, 2)
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

test('accepts a matching loopback origin and rejects mismatched Origin or Host', () => {
  assert.equal(isTrusted({
    headers: { host: '127.0.0.1:13373', origin: 'http://127.0.0.1:13373', 'sec-fetch-site': 'same-origin' },
    socket: { remoteAddress: '127.0.0.1' },
  }), true)
  assert.equal(isTrusted({
    headers: { host: '127.0.0.1:13373', origin: 'http://localhost:13373', 'sec-fetch-site': 'same-origin' },
    socket: { remoteAddress: '127.0.0.1' },
  }), false)
  assert.equal(isTrusted({
    headers: { host: 'example.com:13373', origin: 'http://example.com:13373', 'sec-fetch-site': 'same-origin' },
    socket: { remoteAddress: '127.0.0.1' },
  }), false)
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
