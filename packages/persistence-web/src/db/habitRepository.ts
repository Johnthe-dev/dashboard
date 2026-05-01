import type { IHabitRepository } from '@focal/logic'
import type { HabitRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbHabitRepository implements IHabitRepository {
  async getHabitRecord(moduleId: string): Promise<HabitRecord | null> {
    const db = await getDb()
    const result = await db.get(STORES.HABITS, moduleId)
    return result ?? null
  }

  async putHabitRecord(r: HabitRecord): Promise<void> {
    const db = await getDb()
    await db.put(STORES.HABITS, r)
  }

  async deleteHabitRecord(moduleId: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.HABITS, moduleId)
  }

  async getAllHabits(): Promise<HabitRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.HABITS)
  }

  async clearAllHabits(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.HABITS)
  }
}
