import test from 'node:test'
import assert from 'node:assert/strict'
import { getLibraryHealth } from '../src/zotero-db.js'

test('health reports a missing database without exposing the configured path', () => {
  const result = getLibraryHealth({ dataDir: 'Z:/private/library-that-does-not-exist' })
  assert.equal(result.state, 'missing')
  assert.equal(result.code, 'database_missing')
  assert.equal(JSON.stringify(result).includes('private'), false)
})
