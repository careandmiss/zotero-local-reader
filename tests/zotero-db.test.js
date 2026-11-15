import test from 'node:test'
import assert from 'node:assert/strict'
import { getLibraryHealth, listCollections, withReadOnlyDatabase } from '../src/zotero-db.js'
import { makeLibrary, makeUnsupportedDatabase } from './helpers/fixture.js'

test('health reports a missing database without exposing the configured path', (t) => {
  const { dataDir } = makeLibrary(t)
  const result = getLibraryHealth({ dataDir: `${dataDir}-missing` })
  assert.equal(result.state, 'missing')
  assert.equal(result.code, 'database_missing')
  assert.equal(JSON.stringify(result).includes(dataDir), false)
})

test('valid Zotero schema opens read-only and allows a later health read', (t) => {
  const library = makeLibrary(t)
  assert.deepEqual(getLibraryHealth(library.config), { state: 'ready', source: 'configured' })
  assert.throws(() => withReadOnlyDatabase(library.config, (db) => db.exec("CREATE TABLE should_not_exist (id INTEGER)")))
  assert.deepEqual(getLibraryHealth(library.config), { state: 'ready', source: 'configured' })
  withReadOnlyDatabase(library.config, (db) => {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE name = 'should_not_exist'").get()
    assert.equal(table, undefined)
  })
})

test('collection paths, hierarchy, and item counts come from the local database', (t) => {
  const library = makeLibrary(t)
  const collections = listCollections(library.config)
  assert.equal(collections.length, 2)
  const root = collections.find((collection) => collection.key === 'COLL0001')
  assert.deepEqual(root, { key: 'COLL0001', parentKey: null, depth: 0, name: 'Synthetic papers', path: 'Synthetic papers', itemCount: 2 })
  const child = collections.find((collection) => collection.key === 'COLL0002')
  assert.deepEqual(child, { key: 'COLL0002', parentKey: 'COLL0001', depth: 1, name: 'Experiments', path: 'Synthetic papers / Experiments', itemCount: 1 })
})

test('unsupported schema is reported without returning internal filesystem paths', (t) => {
  const library = makeUnsupportedDatabase(t)
  const result = getLibraryHealth(library.config)
  assert.equal(result.state, 'error')
  assert.equal(result.code, 'schema_unsupported')
  assert.equal(JSON.stringify(result).includes(library.dataDir), false)
})
