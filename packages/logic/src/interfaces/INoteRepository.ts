import type { NoteRecord } from '../types/note'

export interface INoteRepository {
  getNote(moduleId: string): Promise<NoteRecord | undefined>
  putNote(note: NoteRecord): Promise<void>
  deleteNote(moduleId: string): Promise<void>
  getAllNotes(): Promise<NoteRecord[]>
  clearAllNotes(): Promise<void>
}
