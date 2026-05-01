import type { IQuickLinkRepository } from '@focal/logic'
import type { QuickLinkRecord } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbQuickLinkRepository implements IQuickLinkRepository {
  async getLinks(moduleId: string): Promise<QuickLinkRecord | null> {
    const db = await getDb()
    const result = await db.get(STORES.QUICK_LINKS, moduleId)
    return result ?? null
  }

  async putLinks(r: QuickLinkRecord): Promise<void> {
    const db = await getDb()
    await db.put(STORES.QUICK_LINKS, r)
  }

  async deleteLinks(moduleId: string): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.QUICK_LINKS, moduleId)
  }

  async getAllLinks(): Promise<QuickLinkRecord[]> {
    const db = await getDb()
    return db.getAll(STORES.QUICK_LINKS)
  }

  async clearAllLinks(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.QUICK_LINKS)
  }
}
