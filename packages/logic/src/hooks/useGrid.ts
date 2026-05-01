import { useState, useEffect, useCallback, useRef } from 'react'
import type { GridItem, PositionUpdate } from '../types/grid'
import type { ModuleKind } from '../types/modules'
import type { ThemeId } from '../types/theme'
import { usePersistence } from '../context/PersistenceContext'
import { MODULE_REGISTRY } from '../constants/modules'
import { DEFAULT_THEME } from '../constants/themes'

const DEFAULT_ITEMS: GridItem[] = [
  { i: 'default-countdown', kind: 'countdown-timer', themeId: 'sticky-yellow', x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'default-todo', kind: 'todo-list', themeId: 'sticky-pink', x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'default-note', kind: 'note-pad', themeId: 'parchment', x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'default-projects', kind: 'project-tracker', themeId: 'slate', x: 9, y: 0, w: 3, h: 5, minW: 2, minH: 3 },
  { i: 'default-lava', kind: 'lava-lamp', themeId: 'midnight', x: 0, y: 4, w: 2, h: 4, minW: 2, minH: 3 },
  { i: 'default-kaleido', kind: 'kaleidoscope', themeId: 'forest', x: 2, y: 4, w: 3, h: 3, minW: 2, minH: 2 },
]

async function cleanupModuleData(
  kind: ModuleKind,
  moduleId: string,
  repos: ReturnType<typeof usePersistence>,
): Promise<void> {
  switch (kind) {
    case 'todo-list':       return repos.todo.deleteTodosByModule(moduleId)
    case 'note-pad':        return repos.note.deleteNote(moduleId)
    case 'countdown-timer': return repos.countdown.deleteCountdown(moduleId)
    case 'project-tracker': return repos.project.deleteProjectsByModule(moduleId)
    case 'habit-tracker':   return repos.habit.deleteHabitRecord(moduleId)
    case 'quick-links':     return repos.quickLinks.deleteLinks(moduleId)
    case 'mini-calendar':   return repos.calendar.deleteCalendar(moduleId)
    case 'sticky-notes':   return repos.stickyNotes.deleteStickyNotes(moduleId)
    // visual/stateless modules have no data to clean up
    default: return Promise.resolve()
  }
}

export function useGrid() {
  const repos = usePersistence()
  const { grid: repo } = repos
  const [items, setItems] = useState<GridItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    repo.getItems().then((saved) => {
      setItems(saved.length > 0 ? saved : DEFAULT_ITEMS)
      setLoaded(true)
    })
  }, [repo])

  const persistItems = useCallback(
    (nextItems: GridItem[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => repo.putItems(nextItems), 300)
    },
    [repo],
  )

  const updateLayouts = useCallback(
    (positions: PositionUpdate[]) => {
      setItems((prev) => {
        const next = prev.map((item) => {
          const pos = positions.find((p) => p.i === item.i)
          return pos ? { ...item, ...pos } : item
        })
        persistItems(next)
        return next
      })
    },
    [persistItems],
  )

  const addModule = useCallback(
    (kind: ModuleKind) => {
      const meta = MODULE_REGISTRY[kind]
      const newItem: GridItem = {
        i: crypto.randomUUID(),
        kind,
        themeId: DEFAULT_THEME,
        x: 0,
        y: Infinity,
        w: meta.defaultW,
        h: meta.defaultH,
        minW: meta.minW,
        minH: meta.minH,
        maxW: meta.maxW,
        maxH: meta.maxH,
      }
      setItems((prev) => {
        const next = [...prev, newItem]
        persistItems(next)
        return next
      })
    },
    [persistItems],
  )

  const removeModule = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.i === id)
      if (item) await cleanupModuleData(item.kind, id, repos)
      setItems((prev) => {
        const next = prev.filter((i) => i.i !== id)
        persistItems(next)
        return next
      })
    },
    [items, persistItems, repos],
  )

  const setModuleTheme = useCallback(
    (id: string, themeId: ThemeId) => {
      setItems((prev) => {
        const next = prev.map((item) => (item.i === id ? { ...item, themeId } : item))
        persistItems(next)
        return next
      })
    },
    [persistItems],
  )

  const setAllThemes = useCallback(
    (themeId: ThemeId) => {
      setItems((prev) => {
        const next = prev.map((item) => ({ ...item, themeId }))
        persistItems(next)
        return next
      })
    },
    [persistItems],
  )

  return { items, loaded, updateLayouts, addModule, removeModule, setModuleTheme, setAllThemes }
}
