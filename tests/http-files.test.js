import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { DatabaseSync } from 'node:sqlite'
import { createHandler } from '../src/http.js'
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

function pdfUrl(base, itemKey = 'PAPER001', attachmentKey = 'ATTACH01') {
  return `${base}/dsh-zotero-local/api/file/${itemKey}/${attachmentKey}`
}

test('serves only a Zotero-managed child PDF inline with bounded range support', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const full = await fetch(pdfUrl(base))
    const fullBody = await full.text()
    assert.equal(full.status, 200)
    assert.equal(full.headers.get('content-type'), 'application/pdf')
    assert.equal(full.headers.get('content-disposition'), 'inline; filename="zotero-paper.pdf"')
    assert.equal(full.headers.get('accept-ranges'), 'bytes')
    assert.equal(full.headers.get('access-control-allow-origin'), null)
    assert.equal(full.headers.get('cross-origin-resource-policy'), 'same-origin')
    assert.equal(fullBody, '%PDF-1.4\nSynthetic fixture PDF; no real paper content.\n%%EOF\n')

    const partial = await fetch(pdfUrl(base), { headers: { range: 'bytes=0-7' } })
    assert.equal(partial.status, 206)
    assert.equal(partial.headers.get('content-range'), `bytes 0-7/${Buffer.byteLength(fullBody)}`)
    assert.equal(await partial.text(), '%PDF-1.4')

    const suffix = await fetch(pdfUrl(base), { headers: { range: 'bytes=-4' } })
    assert.equal(suffix.status, 206)
    assert.equal(await suffix.text(), fullBody.slice(-4))

    const second = await fetch(pdfUrl(base, 'PAPER001', 'ATTACH02'))
    assert.equal(second.status, 200)
    assert.equal(await second.text(), '%PDF-1.5\nAnother synthetic attachment.\n%%EOF\n')
  })
})

test('rejects malformed and multi-range requests with 416', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    for (const range of ['bytes=999999-', 'bytes=0-1,3-4', 'not-a-range']) {
      const response = await fetch(pdfUrl(base), { headers: { range } })
      assert.equal(response.status, 416)
      assert.equal(response.headers.get('content-range'), `bytes */${Buffer.byteLength('%PDF-1.4\nSynthetic fixture PDF; no real paper content.\n%%EOF\n')}`)
    }
  })
})

test('missing local PDF records return an actionable not-found response', async (t) => {
  const library = makeLibrary(t)
  unlinkSync(library.pdfPath)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const response = await fetch(pdfUrl(base))
    assert.equal(response.status, 404)
    const body = await response.json()
    assert.equal(body.error.code, 'pdf_missing')
    assert.equal(JSON.stringify(body).includes(library.dataDir), false)
  })
})

test('attachment key must belong to the requested parent item', async (t) => {
  const library = makeLibrary(t)
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const response = await fetch(pdfUrl(base, 'PAPER002', 'ATTACH01'))
    assert.equal(response.status, 404)
    const body = await response.json()
    assert.equal(body.error.code, 'pdf_not_found')
    assert.equal(JSON.stringify(body).includes(library.dataDir), false)
  })
})

test('realpath containment blocks a symlink that escapes Zotero storage', async (t) => {
  const library = makeLibrary(t)
  const attachmentDir = join(library.dataDir, 'storage', 'ATTACH02')
  const outsideDir = join(library.dataDir, 'outside-storage')
  rmSync(attachmentDir, { recursive: true, force: true })
  mkdirSync(outsideDir, { recursive: true })
  writeFileSync(join(outsideDir, 'newer.pdf'), Buffer.from('%PDF-1.5\\noutside\\n%%EOF\\n'))
  try {
    symlinkSync(outsideDir, attachmentDir, process.platform === 'win32' ? 'junction' : 'dir')
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP', 'ENOSYS'].includes(error?.code)) {
      t.skip(`directory symlink creation is unavailable: ${error.code}`)
      return
    }
    throw error
  }
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const response = await fetch(pdfUrl(base, 'PAPER001', 'ATTACH02'))
    assert.equal(response.status, 403)
    const body = await response.json()
    assert.equal(body.error.code, 'pdf_path_rejected')
    assert.equal(JSON.stringify(body).includes(library.dataDir), false)
  })
})

test('rejects linked and path-traversal attachment metadata without disclosing paths', async (t) => {
  const library = makeLibrary(t)
  const writer = new DatabaseSync(library.dbPath)
  try {
    writer.prepare('UPDATE itemAttachments SET path = ? WHERE itemID = ?').run('storage:../escape.pdf', 2)
  } finally {
    writer.close()
  }
  const handler = createHandler({ getConfig: () => library.config })
  await withServer(handler, async (base) => {
    const response = await fetch(pdfUrl(base))
    assert.equal(response.status, 404)
    const body = await response.json()
    assert.equal(body.error.code, 'pdf_not_found')
    assert.equal(JSON.stringify(body).includes(library.dataDir), false)
  })
})
