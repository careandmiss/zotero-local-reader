import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { createHandler } from '../src/http.js'

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
    assert.equal(body.ok, false)
    assert.equal(body.error.code, 'database_missing')
  })
})

test('health endpoint rejects cross-site requests', async () => {
  const handler = createHandler({ getConfig: () => ({ dataDir: '' }) })
  await withServer(handler, async (base) => {
    const response = await fetch(`${base}/dsh-zotero-local/api/health`, { headers: { 'sec-fetch-site': 'cross-site' } })
    assert.equal(response.status, 403)
  })
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
