import { mkdtempSync, rmSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SCHEMA = `
CREATE TABLE items (itemID INTEGER PRIMARY KEY, key TEXT NOT NULL UNIQUE, itemTypeID INTEGER NOT NULL, dateAdded TEXT);
CREATE TABLE itemTypes (itemTypeID INTEGER PRIMARY KEY, typeName TEXT NOT NULL);
CREATE TABLE deletedItems (itemID INTEGER PRIMARY KEY);
CREATE TABLE fields (fieldID INTEGER PRIMARY KEY, fieldName TEXT NOT NULL UNIQUE);
CREATE TABLE itemData (itemID INTEGER NOT NULL, fieldID INTEGER NOT NULL, valueID INTEGER NOT NULL, PRIMARY KEY (itemID, fieldID));
CREATE TABLE itemDataValues (valueID INTEGER PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE collections (collectionID INTEGER PRIMARY KEY, key TEXT NOT NULL UNIQUE, collectionName TEXT NOT NULL, parentCollectionID INTEGER);
CREATE TABLE collectionItems (collectionID INTEGER NOT NULL, itemID INTEGER NOT NULL, PRIMARY KEY (collectionID, itemID));
CREATE TABLE itemAttachments (itemID INTEGER PRIMARY KEY, parentItemID INTEGER, linkMode INTEGER, contentType TEXT, path TEXT);
CREATE TABLE creators (creatorID INTEGER PRIMARY KEY, firstName TEXT, lastName TEXT, fieldMode INTEGER DEFAULT 0);
CREATE TABLE itemCreators (itemID INTEGER NOT NULL, creatorID INTEGER NOT NULL, creatorTypeID INTEGER, orderIndex INTEGER NOT NULL, PRIMARY KEY (itemID, orderIndex));
CREATE TABLE itemNotes (itemID INTEGER PRIMARY KEY, parentItemID INTEGER);
CREATE TABLE tags (tagID INTEGER PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE itemTags (itemID INTEGER NOT NULL, tagID INTEGER NOT NULL, PRIMARY KEY (itemID, tagID));
`

export function makeLibrary(t, { name = 'zotero-reader-fixture-' } = {}) {
  const dataDir = mkdtempSync(join(tmpdir(), name))
  const dbPath = join(dataDir, 'zotero.sqlite')
  t.after(() => rmSync(dataDir, { recursive: true, force: true }))
  const db = new DatabaseSync(dbPath)
  db.exec(SCHEMA)
  db.exec(`
    INSERT INTO itemTypes (itemTypeID, typeName) VALUES (1, 'note'), (2, 'journalArticle'), (3, 'attachment');
    INSERT INTO fields (fieldID, fieldName) VALUES (1, 'title'), (2, 'date'), (3, 'abstractNote'), (4, 'DOI'), (5, 'publicationTitle'), (6, 'url');
    INSERT INTO collections (collectionID, key, collectionName, parentCollectionID) VALUES (1, 'COLL0001', 'Synthetic papers', NULL), (2, 'COLL0002', 'Experiments', 1);
    INSERT INTO items (itemID, key, itemTypeID, dateAdded) VALUES
      (1, 'PAPER001', 2, '2025-01-01 00:00:00'),
      (2, 'ATTACH01', 3, '2025-01-01 00:00:01'),
      (3, 'PAPER002', 2, '2024-01-01 00:00:00');
    INSERT INTO collectionItems (collectionID, itemID) VALUES (1, 1), (2, 1), (1, 3);
    INSERT INTO itemDataValues (valueID, value) VALUES
      (1, 'Synthetic article title'), (2, '2025'), (3, 'Synthetic abstract only; no real paper content.'),
      (4, '10.0000/synthetic'), (5, 'Fixture Journal'), (6, 'https://example.invalid/paper'),
      (7, 'Second synthetic title'), (8, '2024'), (9, 'A separate synthetic abstract.');
    INSERT INTO itemData (itemID, fieldID, valueID) VALUES
      (1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4), (1, 5, 5), (1, 6, 6),
      (3, 1, 7), (3, 2, 8), (3, 3, 9);
    INSERT INTO creators (creatorID, firstName, lastName, fieldMode) VALUES (1, 'Example', 'Author', 0), (2, 'Other', 'Writer', 0);
    INSERT INTO itemCreators (itemID, creatorID, creatorTypeID, orderIndex) VALUES (1, 1, 1, 0), (3, 2, 1, 0);
    INSERT INTO tags (tagID, name) VALUES (1, 'Synthetic');
    INSERT INTO itemTags (itemID, tagID) VALUES (1, 1);
    INSERT INTO itemAttachments (itemID, parentItemID, linkMode, contentType, path) VALUES (2, 1, 0, 'application/pdf', 'storage:synthetic.pdf');
  `)
  db.close()
  return { dataDir, dbPath, config: { dataDir } }
}

export function makeUnsupportedDatabase(t, { name = 'zotero-reader-invalid-' } = {}) {
  const dataDir = mkdtempSync(join(tmpdir(), name))
  const dbPath = join(dataDir, 'zotero.sqlite')
  t.after(() => rmSync(dataDir, { recursive: true, force: true }))
  const db = new DatabaseSync(dbPath)
  db.exec('CREATE TABLE not_zotero (value TEXT)')
  db.close()
  return { dataDir, dbPath, config: { dataDir } }
}
