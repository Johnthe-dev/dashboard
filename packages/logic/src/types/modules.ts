export type ModuleKind =
  | 'countdown-timer'
  | 'todo-list'
  | 'note-pad'
  | 'project-tracker'
  | 'lava-lamp'
  | 'kaleidoscope'
  | 'date-display'
  | 'wave-box'
  | 'habit-tracker'
  | 'pomodoro-timer'
  | 'quick-links'
  | 'mini-calendar'
  | 'sticky-notes'

export interface ModuleMeta {
  kind: ModuleKind
  label: string
  description: string
  defaultW: number
  defaultH: number
  minW: number
  minH: number
  maxW?: number
  maxH?: number
}
