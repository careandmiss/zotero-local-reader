import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const client = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
const readerStart = client.indexOf('function ReaderResourcePane')
const panelStart = client.indexOf('function Panel', readerStart)
const readerPane = client.slice(readerStart, panelStart)

function loadBoundedReader() {
  const start = client.indexOf('async function readPdfResponseBounded')
  assert.notEqual(start, -1, 'bounded PDF stream reader exists')
  const end = client.indexOf('\n    function itemKeyFromResourceAddress', start)
  assert.notEqual(end, -1, 'bounded reader is a standalone helper')
  return vm.runInNewContext(`(${client.slice(start, end).trim()})`)
}

test('native reader consumes an unknown-length PDF stream within the byte cap', async () => {
  const readPdfResponseBounded = loadBoundedReader()
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2]))
      controller.enqueue(new Uint8Array([3, 4]))
      controller.close()
    },
  }), { headers: { 'content-type': 'application/pdf' } })

  assert.equal(response.headers.get('content-length'), null)
  const result = await readPdfResponseBounded(response.body, 4)
  assert.equal(result.kind, 'ready')
  assert.deepEqual(Array.from(result.data), [1, 2, 3, 4])
})

test('native reader cancels a stream as soon as the actual byte cap is exceeded', async () => {
  const readPdfResponseBounded = loadBoundedReader()
  let canceled = false
  const response = new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]))
      controller.enqueue(new Uint8Array([4, 5]))
    },
    cancel() { canceled = true },
  }), { headers: { 'content-type': 'application/pdf' } })

  const result = await readPdfResponseBounded(response.body, 4)
  assert.equal(result.kind, 'tooLarge')
  assert.equal(canceled, true)
})

test('native pane uses bounded streaming rather than requiring Content-Length', () => {
  assert.notEqual(readerStart, -1)
  assert.notEqual(panelStart, -1)
  assert.match(readerPane, /Number\.isSafeInteger\(length\)\s*&&\s*length\s*>\s*MAX_NATIVE_PDF_BYTES/)
  assert.match(readerPane, /readPdfResponseBounded\(response\.body,\s*MAX_NATIVE_PDF_BYTES\)/)
  assert.doesNotMatch(readerPane, /await response\.arrayBuffer\(\)/)
})
