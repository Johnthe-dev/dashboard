import type { ModuleKind } from './modules'
import type { ThemeId } from './theme'

export interface GridItem {
  i: string
  kind: ModuleKind
  themeId: ThemeId
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

export interface PositionUpdate {
  i: string
  x: number
  y: number
  w: number
  h: number
}
