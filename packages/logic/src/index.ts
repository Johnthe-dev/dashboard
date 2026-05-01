// Types
export type { CountdownRecord, CountdownStatus } from './types/countdown'
export type { TodoItem, SubTask } from './types/todo'
export type { NoteRecord } from './types/note'
export type { ProjectRecord } from './types/project'
export type { ThemeId, ThemeColors, ThemeMeta } from './types/theme'
export type { ModuleKind, ModuleMeta } from './types/modules'
export type { GridItem, PositionUpdate } from './types/grid'
export type { HabitItem, HabitRecord } from './types/habit'
export { HABIT_COLORS } from './types/habit'
export type { QuickLink, QuickLinkRecord } from './types/quicklink'
export type { CalendarMark, CalendarRecord } from './types/calendar'
export type { StickyNote, StickyNotesRecord } from './types/stickynotes'

// Interfaces
export type { ICountdownRepository } from './interfaces/ICountdownRepository'
export type { ITodoRepository } from './interfaces/ITodoRepository'
export type { INoteRepository } from './interfaces/INoteRepository'
export type { IProjectRepository } from './interfaces/IProjectRepository'
export type { IGridRepository } from './interfaces/IGridRepository'
export type { IHabitRepository } from './interfaces/IHabitRepository'
export type { IQuickLinkRepository } from './interfaces/IQuickLinkRepository'
export type { ICalendarRepository } from './interfaces/ICalendarRepository'
export type { IStickyNotesRepository } from './interfaces/IStickyNotesRepository'

// Context
export { PersistenceProvider, usePersistence } from './context/PersistenceContext'
export type { PersistenceContextValue } from './context/PersistenceContext'

// Hooks
export { useCountdownTimer } from './hooks/useCountdownTimer'
export { useTodo } from './hooks/useTodo'
export { useNote } from './hooks/useNote'
export { useProjectTracker } from './hooks/useProjectTracker'
export { useGrid } from './hooks/useGrid'
export { useHabit } from './hooks/useHabit'
export { useQuickLinks } from './hooks/useQuickLinks'
export { usePomodoro } from './hooks/usePomodoro'
export type { PomodoroPhase, PomodoroState } from './hooks/usePomodoro'
export { useExportImport } from './hooks/useExportImport'
export { useCalendar } from './hooks/useCalendar'
export { useStickyNotes } from './hooks/useStickyNotes'

// Constants
export { THEMES, THEME_COLORS, DEFAULT_THEME } from './constants/themes'
export { MODULE_REGISTRY } from './constants/modules'
export { BREAKPOINTS, COLS, ROW_HEIGHT, MARGIN, CONTAINER_PADDING } from './constants/grid'
