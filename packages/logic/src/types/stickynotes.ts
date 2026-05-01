export interface StickyNote {
  id: number
  text: string
}

export interface StickyNotesRecord {
  moduleId: string
  notes: StickyNote[]
}
