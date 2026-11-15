import test from 'node:test'
import assert from 'node:assert/strict'
import { DatabaseSync } from 'node:sqlite'
import { getItemDetails, listItems, listTags, ZoteroReadError } from '../src/zotero-db.js'
import { makeLibrary } from './helpers/fixture.js'

test('list returns compact bibliographic rows with authors and local-PDF metadata', (t) => {
  const library = makeLibrary(t)
  const result = listItems(library.config, { limit: 10 })
  assert.equal(result.total, 2)
  assert.equal(result.items.length, 2)
  assert.deepEqual(result.items[0], {
    key: 'PAPER001',
    title: 'Synthetic article title',
    authors: ['Example Author'],
    date: '2025',
    itemType: 'journalArticle',
    hasPdfAttachment: true,
  })
  assert.equal(Object.hasOwn(result.items[0], 'abstract'), false)
  assert.equal(result.hasMore, false)
})

test('literal substring search covers title, authors, and abstract', (t) => {
  const library = makeLibrary(t)
  for (const query of ['Synthetic article title', 'Example', 'no real paper content']) {
    const result = listItems(library.config, { query })
    assert.deepEqual(result.items.map((item) => item.key), ['PAPER001'])
  }
  assert.equal(listItems(library.config, { query: '%' }).total, 0)
  assert.equal(listItems(library.config, { query: "' OR 1=1 --" }).total, 0)
})

test('collection filtering, pagination, and page bounds behave consistently', (t) => {
  const library = makeLibrary(t)
  const first = listItems(library.config, { collectionKey: 'COLL0002', limit: 1, offset: 0 })
  assert.equal(first.total, 1)
  assert.equal(first.items[0].key, 'PAPER001')
  assert.equal(first.hasMore, false)
  const page = listItems(library.config, { limit: 1, offset: 0 })
  assert.equal(page.total, 2)
  assert.equal(page.hasMore, true)
  assert.equal(page.items.length, 1)
  assert.equal(listItems(library.config, { limit: 1, offset: 1 }).items[0].key, 'PAPER002')
  assert.throws(() => listItems(library.config, { limit: 101 }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
  assert.throws(() => listItems(library.config, { offset: 1_000_001 }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
})

test('tag counts scope to collection and exact tag filters only matching parent items', (t) => {
  const library = makeLibrary(t)
  assert.deepEqual(listTags(library.config, { query: 'syn' }), [{ name: 'Synthetic', itemCount: 2 }])
  assert.deepEqual(listTags(library.config, { collectionKey: 'COLL0002' }), [{ name: 'Synthetic', itemCount: 1 }])
  assert.deepEqual(listTags(library.config, { query: "' OR 1=1 --" }), [])
  assert.deepEqual(listItems(library.config, { tag: 'Synthetic' }).items.map((item) => item.key), ['PAPER001', 'PAPER002'])
  assert.deepEqual(listItems(library.config, { collectionKey: 'COLL0002', tag: 'Synthetic' }).items.map((item) => item.key), ['PAPER001'])
  assert.equal(listItems(library.config, { tag: "' OR 1=1 --" }).total, 0)
  assert.throws(() => listTags(library.config, { query: 'x'.repeat(201) }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
  assert.throws(() => listItems(library.config, { tag: 'x'.repeat(201) }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
  assert.throws(() => listTags(library.config, { collectionKey: 'invalid' }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
})

test('list sorting uses whitelisted keys and stable page boundaries', (t) => {
  const library = makeLibrary(t)
  const writer = new DatabaseSync(library.dbPath)
  try {
    writer.exec(`
      INSERT INTO items (itemID, key, itemTypeID, dateAdded) VALUES (5, 'PAPER003', 2, '2025-01-01 00:00:00');
      INSERT INTO itemDataValues (valueID, value) VALUES (10, 'Synthetic article title'), (11, '2025');
      INSERT INTO itemData (itemID, fieldID, valueID) VALUES (5, 1, 10), (5, 2, 11);
      INSERT INTO itemCreators (itemID, creatorID, creatorTypeID, orderIndex) VALUES (5, 1, 1, 0);
    `)
  } finally {
    writer.close()
  }

  const firstPage = listItems(library.config, { sort: 'author', direction: 'asc', limit: 2 })
  const secondPage = listItems(library.config, { sort: 'author', direction: 'asc', limit: 2, offset: 2 })
  assert.deepEqual(firstPage.items.map((item) => item.key), ['PAPER003', 'PAPER001'])
  assert.deepEqual(secondPage.items.map((item) => item.key), ['PAPER002'])
  assert.equal(firstPage.hasMore, true)
  assert.equal(secondPage.hasMore, false)
  assert.deepEqual(listItems(library.config, { sort: 'title', direction: 'asc' }).items.map((item) => item.key), ['PAPER002', 'PAPER003', 'PAPER001'])
  assert.deepEqual(listItems(library.config, { sort: 'date', direction: 'desc' }).items.map((item) => item.key), ['PAPER003', 'PAPER001', 'PAPER002'])
  assert.deepEqual(listItems(library.config).items.map((item) => item.key), ['PAPER003', 'PAPER001', 'PAPER002'])
  assert.throws(() => listItems(library.config, { sort: 'title DESC; DROP TABLE items' }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
  assert.throws(() => listItems(library.config, { direction: 'sideways' }), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
})

test('item details include abstract, citation metadata, tags, collections, and attachment status', (t) => {
  const library = makeLibrary(t)
  const item = getItemDetails(library.config, 'PAPER001')
  assert.equal(item.title, 'Synthetic article title')
  assert.deepEqual(item.authors, ['Example Author'])
  assert.equal(item.abstract, 'Synthetic abstract only; no real paper content.')
  assert.equal(item.doi, '10.0000/synthetic')
  assert.equal(item.publicationTitle, 'Fixture Journal')
  assert.deepEqual(item.tags, ['Synthetic'])
  assert.equal(item.collections.some((collection) => collection.key === 'COLL0002'), true)
  assert.equal(item.hasPdfAttachment, true)
  assert.deepEqual(item.pdfAttachments.map((attachment) => attachment.key), ['ATTACH02', 'ATTACH01'])
  assert.equal(getItemDetails(library.config, 'PAPER009'), null)
  assert.throws(() => getItemDetails(library.config, '../PAPER'), (error) => error instanceof ZoteroReadError && error.code === 'bad_request')
})

test('a subsequent query sees a new committed local item without restarting the reader', (t) => {
  const library = makeLibrary(t)
  assert.equal(listItems(library.config).total, 2)
  const writer = new DatabaseSync(library.dbPath)
  try {
    writer.exec("INSERT INTO items (itemID, key, itemTypeID, dateAdded) VALUES (5, 'PAPER003', 2, '2026-01-01 00:00:00')")
    writer.exec("INSERT INTO itemDataValues (valueID, value) VALUES (10, 'Fresh synthetic title')")
    writer.exec('INSERT INTO itemData (itemID, fieldID, valueID) VALUES (4, 1, 10)')
  } finally {
    writer.close()
  }
  const refreshed = listItems(library.config)
  assert.equal(refreshed.total, 3)
  assert.equal(refreshed.items[0].key, 'PAPER003')
})
