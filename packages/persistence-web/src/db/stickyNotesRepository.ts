import type { IStickyNotesRepository } from '@focal/logic'
import type { StickyNotesRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbStickyNotesRepository implements IStickyNotesRepository {
  async getStickyNotes(moduleId: string): Promise<StickyNotesRecord | null> {
    const db = await getDb()
    return (await db.get(STORES.STICKY_NOTES, moduleId)) ?? null
  }

  async putStickyNotes(record: StickyNotesRecord): Promise<void> {
    const db = await getDb()
    await db.put(STORES.STICKY_NOTES, record)
  }

  async deleteStickyNotes(moduleId: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.STICKY_NOTES, moduleId)
  }

  async getAllStickyNotes(): Promise<StickyNotesRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.STICKY_NOTES)
  }

  async clearAllStickyNotes(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.STICKY_NOTES)
  }
}
