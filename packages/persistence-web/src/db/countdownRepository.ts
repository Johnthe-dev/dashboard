import type { ICountdownRepository } from '@focal/logic'
import type { CountdownRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbCountdownRepository implements ICountdownRepository {
  async getCountdown(moduleId: string): Promise<CountdownRecord | undefined> {
    const db = await getDb()
    return db.get(STORES.COUNTDOWNS, moduleId)
  }

  async putCountdown(record: CountdownRecord): Promise<void> {
    const db = await getDb()
    await db.put(STORES.COUNTDOWNS, record)
  }

  async deleteCountdown(moduleId: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.COUNTDOWNS, moduleId)
  }

  async getAllCountdowns(): Promise<CountdownRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.COUNTDOWNS)
  }

  async clearAllCountdowns(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.COUNTDOWNS)
  }
}
