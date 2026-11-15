import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const client = readFileSync(new URL('../client.js', import.meta.url), 'utf8')
const readerStart = client.indexOf('function ReaderResourcePane')
const panelStart = client.indexOf('function Panel', readerStart)
const readerPane = client.slice(readerStart, panelStart)

test('rightbar resource tab consumes the built-in document slot without redeclaring it', () => {
  const injection = client.indexOf("ctx.slots.inject('sidebar.right.pane.tab'")
  assert.notEqual(injection, -1, 'resource tab pane registration exists')

  const key = client.indexOf('key: READER_TAB_ID', injection)
  assert.notEqual(key, -1, 'resource tab pane registration uses READER_TAB_ID')
  const end = client.indexOf('}, ResourceBody))', key)
  assert.notEqual(end, -1, 'resource tab pane registration has a ResourceBody')

  const paneRegistration = client.slice(key, end)
  assert.doesNotMatch(paneRegistration, /children\s*:/,
    'sidebar.right.tab.document is already declared by ui-sidebar-documentpreview')
  assert.match(readerPane, /renderSlot\('sidebar\.right\.tab\.document'/,
    'resource pane still renders the selected native document body')
})

test('native PDF errors expose only safe diagnostic codes', () => {
  assert.notEqual(readerStart, -1, 'native resource pane exists')
  assert.notEqual(panelStart, -1, 'resource pane ends before the library panel')
  assert.match(client, /const SAFE_PDF_ERROR_CODES = new Set\(/)
  assert.match(client, /function safePdfDiagnosticCode\(/)
  assert.match(readerPane, /setPdfDiagnostic\(safePdfDiagnosticCode\(errorCode, response\.status\)\)/)
  assert.match(readerPane, /setPdfDiagnostic\('network_error'\)/)
  assert.match(readerPane, /pdfStatus === 'error' && pdfDiagnostic/)
  assert.match(readerPane, /t\('item\.pdfDiagnostic'\)/)
})
