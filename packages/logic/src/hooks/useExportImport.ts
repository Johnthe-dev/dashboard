import { useCallback } from 'react'
import { usePersistence } from '../context/PersistenceContext'

interface FocalBackup {
  version: 1
  exportedAt: string
  grid: unknown[]
  todos: unknown[]
  notes: unknown[]
  projects: unknown[]
  countdowns: unknown[]
  habits: unknown[]
  quickLinks: unknown[]
  calendars: unknown[]
  stickyNotes: unknown[]
}

function isFocalBackup(obj: unknown): obj is FocalBackup {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    (obj as Record<string, unknown>).version === 1
  )
}

export function useExportImport() {
  const { grid, todo, note, project, countdown, habit, quickLinks, calendar, stickyNotes } = usePersistence()

  const exportJson = useCallback(async () => {
    const [gridItems, todos, notes, projects, countdowns, habits, links, calendars, stickyNotesList] =
      await Promise.all([
        grid.getItems(),
        todo.getAllTodos(),
        note.getAllNotes(),
        project.getAllProjects(),
        countdown.getAllCountdowns(),
        habit.getAllHabits(),
        quickLinks.getAllLinks(),
        calendar.getAllCalendars(),
        stickyNotes.getAllStickyNotes(),
      ])

    const backup: FocalBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      grid: gridItems,
      todos,
      notes,
      projects,
      countdowns,
      habits,
      quickLinks: links,
      stickyNotes: stickyNotesList,
      calendars,
    }

    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const dateStr = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `focal-backup-${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [grid, todo, note, project, countdown, habit, quickLinks, calendar])

  const importJson = useCallback(
    async (file: File) => {
      const text = await file.text()
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new Error('Invalid JSON file')
      }

      if (!isFocalBackup(parsed)) {
        throw new Error('Not a valid Focal backup (missing version: 1)')
      }

      const confirmed = window.confirm(
        'This will overwrite all your current data with the backup. Continue?',
      )
      if (!confirmed) return

      // Clear all stores
      await Promise.all([
        grid.putItems([]),
        todo.clearAllTodos(),
        note.clearAllNotes(),
        project.clearAllProjects(),
        countdown.clearAllCountdowns(),
        habit.clearAllHabits(),
        quickLinks.clearAllLinks(),
        calendar.clearAllCalendars(),
        stickyNotes.clearAllStickyNotes(),
      ])

      // Write grid
      if (Array.isArray(parsed.grid) && parsed.grid.length > 0) {
        await grid.putItems(parsed.grid as Parameters<typeof grid.putItems>[0])
      }

      // Write todos
      if (Array.isArray(parsed.todos)) {
        for (const t of parsed.todos) {
          await todo.putTodo(t as Parameters<typeof todo.putTodo>[0])
        }
      }

      // Write notes
      if (Array.isArray(parsed.notes)) {
        for (const n of parsed.notes) {
          await note.putNote(n as Parameters<typeof note.putNote>[0])
        }
      }

      // Write projects
      if (Array.isArray(parsed.projects)) {
        for (const p of parsed.projects) {
          await project.putProject(p as Parameters<typeof project.putProject>[0])
        }
      }

      // Write countdowns
      if (Array.isArray(parsed.countdowns)) {
        for (const c of parsed.countdowns) {
          await countdown.putCountdown(c as Parameters<typeof countdown.putCountdown>[0])
        }
      }

      // Write habits
      if (Array.isArray(parsed.habits)) {
        for (const h of parsed.habits) {
          await habit.putHabitRecord(h as Parameters<typeof habit.putHabitRecord>[0])
        }
      }

      // Write quick links
      if (Array.isArray(parsed.quickLinks)) {
        for (const l of parsed.quickLinks) {
          await quickLinks.putLinks(l as Parameters<typeof quickLinks.putLinks>[0])
        }
      }

      // Write calendars
      if (Array.isArray(parsed.calendars)) {
        for (const c of parsed.calendars) {
          await calendar.putCalendar(c as Parameters<typeof calendar.putCalendar>[0])
        }
      }

      // Write sticky notes
      if (Array.isArray(parsed.stickyNotes)) {
        for (const s of parsed.stickyNotes) {
          await stickyNotes.putStickyNotes(s as Parameters<typeof stickyNotes.putStickyNotes>[0])
        }
      }

      window.location.reload()
    },
    [grid, todo, note, project, countdown, habit, quickLinks, calendar, stickyNotes],
  )

  return { exportJson, importJson }
}
