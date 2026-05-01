import { useMemo, type ReactNode } from 'react'
import { PersistenceProvider } from '@focal/logic'
import { IdbCountdownRepository } from './db/countdownRepository'
import { IdbTodoRepository } from './db/todoRepository'
import { IdbNoteRepository } from './db/noteRepository'
import { IdbProjectRepository } from './db/projectRepository'
import { IdbGridRepository } from './db/gridRepository'
import { IdbHabitRepository } from './db/habitRepository'
import { IdbQuickLinkRepository } from './db/quickLinkRepository'
import { IdbCalendarRepository } from './db/calendarRepository'
import { IdbStickyNotesRepository } from './db/stickyNotesRepository'

const countdown = new IdbCountdownRepository()
const todo = new IdbTodoRepository()
const note = new IdbNoteRepository()
const project = new IdbProjectRepository()
const grid = new IdbGridRepository()
const habit = new IdbHabitRepository()
const quickLinks = new IdbQuickLinkRepository()
const calendar = new IdbCalendarRepository()
const stickyNotes = new IdbStickyNotesRepository()

const webPersistence = { countdown, todo, note, project, grid, habit, quickLinks, calendar, stickyNotes }

export function WebPersistenceProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => webPersistence, [])
  return <PersistenceProvider value={value}>{children}</PersistenceProvider>
}
