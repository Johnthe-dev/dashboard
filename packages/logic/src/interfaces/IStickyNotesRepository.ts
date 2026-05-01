import type { StickyNotesRecord } from '../types/stickynotes'

export interface IStickyNotesRepository {
  getStickyNotes(moduleId: string): Promise<StickyNotesRecord | null>
  putStickyNotes(record: StickyNotesRecord): Promise<void>
  deleteStickyNotes(moduleId: string): Promise<void>
  getAllStickyNotes(): Promise<StickyNotesRecord[]>
  clearAllStickyNotes(): Promise<void>
}
