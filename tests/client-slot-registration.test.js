import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const client = readFileSync(new URL('../client.js', import.meta.url), 'utf8')

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
  assert.match(client, /renderSlot\('sidebar\.right\.tab\.document'/,
    'resource pane still renders the selected native document body')
})
