import type { GridItem } from '../types/grid'

export interface IGridRepository {
  getItems(): Promise<GridItem[]>
  putItems(items: GridItem[]): Promise<void>
}
