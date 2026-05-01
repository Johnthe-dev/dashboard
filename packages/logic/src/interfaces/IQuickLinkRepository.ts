import type { QuickLinkRecord } from '../types/quicklink'

export interface IQuickLinkRepository {
  getLinks(moduleId: string): Promise<QuickLinkRecord | null>
  putLinks(r: QuickLinkRecord): Promise<void>
  deleteLinks(moduleId: string): Promise<void>
  getAllLinks(): Promise<QuickLinkRecord[]>
  clearAllLinks(): Promise<void>
}
