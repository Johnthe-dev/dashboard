import type { INoteRepository } from '@focal/logic'
import type { NoteRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbNoteRepository implements INoteRepository {
  async getNote(moduleId: string): Promise<NoteRecord | undefined> {
    const db = await getDb()
    return db.get(STORES.NOTES, moduleId)
  }

  async putNote(note: NoteRecord): Promise<void> {
    const db = await getDb()
    await db.put(STORES.NOTES, note)
  }

  async deleteNote(moduleId: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.NOTES, moduleId)
  }

  async getAllNotes(): Promise<NoteRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.NOTES)
  }

  async clearAllNotes(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.NOTES)
  }
}
