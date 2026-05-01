import type { IGridRepository } from '@focal/logic'
import type { GridItem } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

const KEY = 'items'

export class IdbGridRepository implements IGridRepository {
  async getItems(): Promise<GridItem[]> {
    const db = await getDb()
    return (await db.get(STORES.GRID, KEY)) ?? []
  }

  async putItems(items: GridItem[]): Promise<void> {
    const db = await getDb()
    await db.put(STORES.GRID, items, KEY)
  }
}
