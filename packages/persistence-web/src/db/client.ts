import { openDB, type IDBPDatabase } from 'idb'
import { DB_NAME, DB_VERSION, STORES } from './schema'

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore(STORES.GRID)
          db.createObjectStore(STORES.TODOS, { keyPath: 'id', autoIncrement: true })
          db.createObjectStore(STORES.NOTES, { keyPath: 'moduleId' })
          db.createObjectStore(STORES.PROJECTS, { keyPath: 'id', autoIncrement: true })
          db.createObjectStore(STORES.COUNTDOWNS, { keyPath: 'moduleId' })
        }
        if (oldVersion < 2) {
          db.createObjectStore(STORES.HABITS, { keyPath: 'moduleId' })
          db.createObjectStore(STORES.QUICK_LINKS, { keyPath: 'moduleId' })
        }
        if (oldVersion < 3) {
          db.createObjectStore(STORES.CALENDARS, { keyPath: 'moduleId' })
        }
        if (oldVersion < 4) {
          db.createObjectStore(STORES.STICKY_NOTES, { keyPath: 'moduleId' })
        }
      },
    })
  }
  return dbPromise
}
