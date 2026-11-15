import { existsSync, statSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'

const REQUIRED_TABLES = [
  'items', 'itemTypes', 'deletedItems', 'fields', 'itemData', 'itemDataValues',
  'collections', 'collectionItems', 'itemAttachments', 'creators', 'itemCreators',
]

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
        name: row.collectionName,
        path: names.reverse().join(' / '),
        itemCount: row.itemCount,
      }
    })
  })
}
