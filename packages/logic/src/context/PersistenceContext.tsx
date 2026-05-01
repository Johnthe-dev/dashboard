import { createContext, useContext } from 'react'
import type { ICountdownRepository } from '../interfaces/ICountdownRepository'
import type { ITodoRepository } from '../interfaces/ITodoRepository'
import type { INoteRepository } from '../interfaces/INoteRepository'
import type { IProjectRepository } from '../interfaces/IProjectRepository'
import type { IGridRepository } from '../interfaces/IGridRepository'
import type { IHabitRepository } from '../interfaces/IHabitRepository'
import type { IQuickLinkRepository } from '../interfaces/IQuickLinkRepository'
import type { ICalendarRepository } from '../interfaces/ICalendarRepository'
import type { IStickyNotesRepository } from '../interfaces/IStickyNotesRepository'

export interface PersistenceContextValue {
  countdown: ICountdownRepository
  todo: ITodoRepository
  note: INoteRepository
  project: IProjectRepository
  grid: IGridRepository
  habit: IHabitRepository
  quickLinks: IQuickLinkRepository
  calendar: ICalendarRepository
  stickyNotes: IStickyNotesRepository
}

const PersistenceContext = createContext<PersistenceContextValue | null>(null)

export const PersistenceProvider = PersistenceContext.Provider

export function usePersistence(): PersistenceContextValue {
  const ctx = useContext(PersistenceContext)
  if (!ctx) throw new Error('usePersistence must be inside a PersistenceProvider')
  return ctx
}
