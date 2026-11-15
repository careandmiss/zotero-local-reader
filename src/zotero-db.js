import { existsSync, statSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { homedir } from 'node:os'
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'

const REQUIRED_TABLES = [
  'items', 'itemTypes', 'deletedItems', 'fields', 'itemData', 'itemDataValues',
  'collections', 'collectionItems', 'itemAttachments', 'itemNotes', 'creators',
  'itemCreators', 'tags', 'itemTags',
]
const ITEM_LIMIT_DEFAULT = 50
const ITEM_LIMIT_MAX = 100
const OFFSET_MAX = 1_000_000
const QUERY_MAX_LENGTH = 200
export const LIST_SORT_FIELDS = Object.freeze(['dateAdded', 'title', 'date', 'author'])
export const LIST_SORT_DIRECTIONS = Object.freeze(['asc', 'desc'])

export class ZoteroReadError extends Error {
  constructor(code, message, options) {
    super(message, options)
    this.name = 'ZoteroReadError'
    this.code = code
  }
}

function dataLocation(config = {}) {
  const configured = typeof config.dataDir === 'string' ? config.dataDir.trim() : ''
  if (configured) {
    const path = resolve(configured)
    const dbPath = basename(path).toLowerCase() === 'zotero.sqlite' ? path : join(path, 'zotero.sqlite')
    return { dbPath, dataDir: basename(path).toLowerCase() === 'zotero.sqlite' ? dirname(path) : path, source: 'configured' }
  }
  const dbOverride = process.env.ZOTERO_DB_PATH?.trim()
  if (dbOverride) {
    const dbPath = resolve(dbOverride)
    return { dbPath, dataDir: dirname(dbPath), source: 'environment' }
  }
  const directoryOverride = process.env.ZOTERO_DATA_DIR?.trim()
  if (directoryOverride) {
    const dataDir = resolve(directoryOverride)
    return { dbPath: join(dataDir, 'zotero.sqlite'), dataDir, source: 'environment' }
  }
  const dataDir = join(homedir(), 'Zotero')
  return { dbPath: join(dataDir, 'zotero.sqlite'), dataDir, source: 'default' }
}

function openDatabase(config = {}) {
  const location = dataLocation(config)
  if (!existsSync(location.dbPath)) {
    throw new ZoteroReadError('database_missing', 'Zotero database not found. Configure the Zotero data directory in plugin settings.')
  }
  try {
    if (!statSync(location.dbPath).isFile()) {
      throw new ZoteroReadError('database_missing', 'The configured Zotero database path is not a file.')
    }
    const db = new DatabaseSync(location.dbPath, { readOnly: true })
    db.exec('PRAGMA query_only = ON; PRAGMA busy_timeout = 2500;')
    return { db, location }
  } catch (error) {
    if (error instanceof ZoteroReadError) throw error
    const message = String(error?.message ?? error).toLowerCase()
    if (message.includes('busy') || message.includes('locked')) {
      throw new ZoteroReadError('database_busy', 'Zotero is syncing or indexing the library. Wait briefly and retry.', { cause: error })
    }
    if (message.includes('not a database') || message.includes('malformed')) {
      throw new ZoteroReadError('database_invalid', 'The selected file is not a readable Zotero database.', { cause: error })
    }
    throw new ZoteroReadError('database_unavailable', 'Could not open the Zotero database read-only.', { cause: error })
  }
}

function checkSchema(db) {
  let rows
  try {
    rows = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()
  } catch (error) {
    throw new ZoteroReadError('database_invalid', 'Could not inspect the Zotero database schema.', { cause: error })
  }
  const names = new Set(rows.map((row) => row.name))
  const missing = REQUIRED_TABLES.filter((name) => !names.has(name))
  if (missing.length) {
    throw new ZoteroReadError('schema_unsupported', 'This Zotero database schema is not supported by the current reader.')
  }
}

export function withReadOnlyDatabase(config, operation) {
  const { db, location } = openDatabase(config)
  try {
    checkSchema(db)
    return operation(db, location)
  } catch (error) {
    if (error instanceof ZoteroReadError) throw error
    const message = String(error?.message ?? error).toLowerCase()
    if (message.includes('busy') || message.includes('locked')) {
      throw new ZoteroReadError('database_busy', 'Zotero is syncing or indexing the library. Wait briefly and retry.', { cause: error })
    }
    throw error
  } finally {
    db.close()
  }
}

export function getLibraryHealth(config = {}) {
  try {
    return withReadOnlyDatabase(config, (_db, location) => ({ state: 'ready', source: location.source }))
  } catch (error) {
    if (error instanceof ZoteroReadError) {
      const state = error.code === 'database_missing' ? 'missing' : error.code === 'database_busy' ? 'busy' : 'error'
      return { state, code: error.code, message: error.message }
    }
    return { state: 'error', code: 'database_unavailable', message: 'Could not read the Zotero library.' }
  }
}

export function assertDatabaseReadable(config = {}) {
  return withReadOnlyDatabase(config, (_db, location) => ({ state: 'ready', source: location.source }))
}

export function listCollections(config = {}) {
  return withReadOnlyDatabase(config, (db) => {
    const rows = db.prepare(`
      SELECT c.collectionID, c.key, c.collectionName, c.parentCollectionID,
             COALESCE(counts.itemCount, 0) AS itemCount
      FROM collections c
      LEFT JOIN (
        SELECT ci.collectionID, COUNT(i.itemID) AS itemCount
        FROM collectionItems ci
        JOIN items i ON i.itemID = ci.itemID
        WHERE i.itemID NOT IN (SELECT itemID FROM deletedItems)
        GROUP BY ci.collectionID
      ) counts ON counts.collectionID = c.collectionID
      ORDER BY c.collectionName COLLATE NOCASE
    `).all()
    const byId = new Map(rows.map((row) => [row.collectionID, row]))
    return rows.map((row) => {
      const names = [row.collectionName]
      const seen = new Set([row.collectionID])
      let parentId = row.parentCollectionID
      while (parentId && byId.has(parentId) && !seen.has(parentId)) {
        seen.add(parentId)
        const parent = byId.get(parentId)
        names.push(parent.collectionName)
        parentId = parent.parentCollectionID
      }
      return {
        key: row.key,
        parentKey: row.parentCollectionID && byId.has(row.parentCollectionID) ? byId.get(row.parentCollectionID).key : null,
        depth: names.length - 1,
        name: row.collectionName,
        path: names.reverse().join(' / '),
        itemCount: row.itemCount,
      }
    })
  })
}

function validateItemKey(key) {
  if (typeof key !== 'string' || !/^[A-Za-z0-9]{8}$/u.test(key)) {
    throw new ZoteroReadError('bad_request', 'Invalid Zotero item key.')
  }
}

function normalizeListOptions(options = {}) {
  const query = typeof options.query === 'string' ? options.query.trim() : ''
  if (query.length > QUERY_MAX_LENGTH) throw new ZoteroReadError('bad_request', 'Search query is too long.')
  const collectionKey = typeof options.collectionKey === 'string' && options.collectionKey !== '' ? options.collectionKey : null
  if (collectionKey && !/^[A-Za-z0-9]{8}$/u.test(collectionKey)) throw new ZoteroReadError('bad_request', 'Invalid Zotero collection key.')
  const limit = options.limit ?? ITEM_LIMIT_DEFAULT
  const offset = options.offset ?? 0
  const sort = options.sort ?? 'dateAdded'
  const direction = options.direction ?? 'desc'
  if (!Number.isInteger(limit) || limit < 1 || limit > ITEM_LIMIT_MAX) throw new ZoteroReadError('bad_request', `Page size must be between 1 and ${ITEM_LIMIT_MAX}.`)
  if (!Number.isInteger(offset) || offset < 0 || offset > OFFSET_MAX) throw new ZoteroReadError('bad_request', 'Invalid page offset.')
  if (!LIST_SORT_FIELDS.includes(sort)) throw new ZoteroReadError('bad_request', 'Invalid sort field.')
  if (!LIST_SORT_DIRECTIONS.includes(direction)) throw new ZoteroReadError('bad_request', 'Invalid sort direction.')
  return { query, collectionKey, limit, offset, sort, direction }
}

function escapeLike(value) {
  return value.replace(/[!%_]/gu, (character) => `!${character}`)
}

const ITEM_FROM = `
  FROM items i
  JOIN itemTypes it ON it.itemTypeID = i.itemTypeID
  LEFT JOIN itemData td ON td.itemID = i.itemID AND td.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'title')
  LEFT JOIN itemDataValues title ON title.valueID = td.valueID
  LEFT JOIN itemData dd ON dd.itemID = i.itemID AND dd.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'date')
  LEFT JOIN itemDataValues date ON date.valueID = dd.valueID
  LEFT JOIN itemData ad ON ad.itemID = i.itemID AND ad.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'abstractNote')
  LEFT JOIN itemDataValues abstract ON abstract.valueID = ad.valueID
`

const LIST_SORT_SQL = Object.freeze({
  dateAdded: 'i.dateAdded',
  title: "COALESCE(title.value, '') COLLATE NOCASE",
  date: "COALESCE(date.value, '') COLLATE NOCASE",
  author: `COALESCE((
    SELECT CASE WHEN c.fieldMode = 1 THEN COALESCE(c.lastName, '')
      ELSE TRIM(COALESCE(c.lastName, '') || ' ' || COALESCE(c.firstName, '')) END
    FROM itemCreators ic JOIN creators c ON c.creatorID = ic.creatorID
    WHERE ic.itemID = i.itemID
    ORDER BY ic.orderIndex
    LIMIT 1
  ), '') COLLATE NOCASE`,
})

function itemFilters({ query, collectionKey }) {
  const clauses = [
    "i.itemID NOT IN (SELECT itemID FROM deletedItems)",
    "it.typeName NOT IN ('note', 'attachment', 'annotation')",
    'i.itemID NOT IN (SELECT itemID FROM itemAttachments WHERE parentItemID IS NOT NULL)',
    'i.itemID NOT IN (SELECT itemID FROM itemNotes WHERE parentItemID IS NOT NULL)',
  ]
  const params = []
  if (query) {
    const like = `%${escapeLike(query)}%`
    clauses.push(`(
      COALESCE(title.value, '') LIKE ? ESCAPE '!'
      OR COALESCE(abstract.value, '') LIKE ? ESCAPE '!'
      OR EXISTS (
        SELECT 1 FROM itemCreators ic JOIN creators c ON c.creatorID = ic.creatorID
        WHERE ic.itemID = i.itemID
          AND (COALESCE(c.firstName, '') LIKE ? ESCAPE '!' OR COALESCE(c.lastName, '') LIKE ? ESCAPE '!')
      )
    )`)
    params.push(like, like, like, like)
  }
  if (collectionKey) {
    clauses.push('EXISTS (SELECT 1 FROM collectionItems ci JOIN collections c ON c.collectionID = ci.collectionID WHERE ci.itemID = i.itemID AND c.key = ?)')
    params.push(collectionKey)
  }
  return { sql: clauses.join(' AND '), params }
}

function creatorNames(db, itemIds) {
  if (!itemIds.length) return new Map()
  const placeholders = itemIds.map(() => '?').join(', ')
  const rows = db.prepare(`
    SELECT ic.itemID, c.firstName, c.lastName, c.fieldMode
    FROM itemCreators ic JOIN creators c ON c.creatorID = ic.creatorID
    WHERE ic.itemID IN (${placeholders})
    ORDER BY ic.itemID, ic.orderIndex
  `).all(...itemIds)
  const byItem = new Map()
  for (const row of rows) {
    const first = String(row.firstName ?? '').trim()
    const last = String(row.lastName ?? '').trim()
    const name = Number(row.fieldMode) === 1 ? last : [first, last].filter(Boolean).join(' ')
    if (!name) continue
    const authors = byItem.get(row.itemID) ?? []
    authors.push(name)
    byItem.set(row.itemID, authors)
  }
  return byItem
}

export function listItems(config = {}, options = {}) {
  const normalized = normalizeListOptions(options)
  return withReadOnlyDatabase(config, (db) => {
    const filters = itemFilters(normalized)
    const totalRow = db.prepare(`SELECT COUNT(*) AS total ${ITEM_FROM} WHERE ${filters.sql}`).get(...filters.params)
    const rows = db.prepare(`
      SELECT i.itemID, i.key, it.typeName AS itemType,
             COALESCE(title.value, '') AS title,
             COALESCE(date.value, '') AS date,
             i.dateAdded,
             EXISTS (
               SELECT 1 FROM itemAttachments a
               WHERE a.parentItemID = i.itemID AND a.contentType = 'application/pdf' AND a.path LIKE 'storage:%'
             ) AS hasPdfAttachment
      ${ITEM_FROM}
      WHERE ${filters.sql}
      ORDER BY ${LIST_SORT_SQL[normalized.sort]} ${normalized.direction.toUpperCase()}, i.itemID DESC
      LIMIT ? OFFSET ?
    `).all(...filters.params, normalized.limit, normalized.offset)
    const authors = creatorNames(db, rows.map((row) => row.itemID))
    return {
      total: totalRow.total,
      limit: normalized.limit,
      offset: normalized.offset,
      hasMore: normalized.offset + rows.length < totalRow.total,
      items: rows.map((row) => ({
        key: row.key,
        title: row.title,
        authors: authors.get(row.itemID) ?? [],
        date: row.date,
        itemType: row.itemType,
        hasPdfAttachment: Boolean(row.hasPdfAttachment),
      })),
    }
  })
}

export function getItemDetails(config = {}, key) {
  validateItemKey(key)
  return withReadOnlyDatabase(config, (db) => {
    const row = db.prepare(`
      SELECT i.itemID, i.key, it.typeName AS itemType,
             COALESCE(title.value, '') AS title,
             COALESCE(date.value, '') AS date,
             COALESCE(abstract.value, '') AS abstract,
             COALESCE(doi.value, '') AS doi,
             COALESCE(publication.value, '') AS publicationTitle,
             COALESCE(url.value, '') AS url
      FROM items i
      JOIN itemTypes it ON it.itemTypeID = i.itemTypeID
      LEFT JOIN itemData td ON td.itemID = i.itemID AND td.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'title')
      LEFT JOIN itemDataValues title ON title.valueID = td.valueID
      LEFT JOIN itemData dd ON dd.itemID = i.itemID AND dd.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'date')
      LEFT JOIN itemDataValues date ON date.valueID = dd.valueID
      LEFT JOIN itemData ad ON ad.itemID = i.itemID AND ad.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'abstractNote')
      LEFT JOIN itemDataValues abstract ON abstract.valueID = ad.valueID
      LEFT JOIN itemData ddoi ON ddoi.itemID = i.itemID AND ddoi.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'DOI')
      LEFT JOIN itemDataValues doi ON doi.valueID = ddoi.valueID
      LEFT JOIN itemData dpublication ON dpublication.itemID = i.itemID AND dpublication.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'publicationTitle')
      LEFT JOIN itemDataValues publication ON publication.valueID = dpublication.valueID
      LEFT JOIN itemData durl ON durl.itemID = i.itemID AND durl.fieldID = (SELECT fieldID FROM fields WHERE fieldName = 'url')
      LEFT JOIN itemDataValues url ON url.valueID = durl.valueID
      WHERE i.key = ? AND i.itemID NOT IN (SELECT itemID FROM deletedItems)
        AND it.typeName NOT IN ('note', 'attachment', 'annotation')
    `).get(key)
    if (!row) return null
    const authors = creatorNames(db, [row.itemID]).get(row.itemID) ?? []
    const tags = db.prepare(`
      SELECT t.name FROM itemTags itg JOIN tags t ON t.tagID = itg.tagID
      WHERE itg.itemID = ? ORDER BY t.name COLLATE NOCASE
    `).all(row.itemID).map((tag) => tag.name)
    const collections = db.prepare(`
      SELECT c.key, c.collectionName AS name
      FROM collectionItems ci JOIN collections c ON c.collectionID = ci.collectionID
      WHERE ci.itemID = ? ORDER BY c.collectionName COLLATE NOCASE
    `).all(row.itemID)
    const pdfAttachments = db.prepare(`
      SELECT ai.key AS key, ai.dateAdded AS dateAdded
      FROM itemAttachments a JOIN items ai ON ai.itemID = a.itemID
      WHERE a.parentItemID = ? AND a.contentType = 'application/pdf' AND a.path LIKE 'storage:%'
      ORDER BY ai.dateAdded DESC, ai.itemID DESC
    `).all(row.itemID)
      .filter((attachment) => /^[A-Za-z0-9]{8}$/u.test(attachment.key))
      .map((attachment) => ({ key: attachment.key, dateAdded: attachment.dateAdded ?? '' }))
    const hasPdfAttachment = pdfAttachments.length > 0
    return {
      key: row.key,
      title: row.title,
      authors,
      date: row.date,
      itemType: row.itemType,
      abstract: row.abstract,
      doi: row.doi,
      publicationTitle: row.publicationTitle,
      url: row.url,
      tags,
      collections,
      hasPdfAttachment,
      pdfAttachments,
    }
  })
}

export function findPdfForItem(config = {}, parentKey, attachmentKey) {
  validateItemKey(parentKey)
  validateItemKey(attachmentKey)
  return withReadOnlyDatabase(config, (db, location) => {
    const row = db.prepare(`
      SELECT ai.key AS attachmentKey, a.path AS attachmentPath
      FROM items parent
      JOIN itemAttachments a ON a.parentItemID = parent.itemID
      JOIN items ai ON ai.itemID = a.itemID
      WHERE parent.key = ? AND ai.key = ? AND a.contentType = 'application/pdf'
      LIMIT 1
    `).get(parentKey, attachmentKey)
    if (!row || typeof row.attachmentPath !== 'string' || !row.attachmentPath.startsWith('storage:')) return null
    const filename = row.attachmentPath.slice('storage:'.length)
    if (!filename || filename === '.' || filename === '..' || /[\\/\0:]/u.test(filename) || extname(filename).toLowerCase() !== '.pdf') return null
    const storageRoot = resolve(location.dataDir, 'storage')
    const filePath = resolve(storageRoot, row.attachmentKey, filename)
    const relativePath = relative(storageRoot, filePath)
    if (!relativePath || relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) return null
    return { storageRoot, filePath }
  })
}
