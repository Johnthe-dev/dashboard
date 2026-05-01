import { useState, useEffect, useCallback } from 'react'
import type { CalendarMark } from '../types/calendar'
import { usePersistence } from '../context/PersistenceContext'

export function useCalendar(moduleId: string) {
  const { calendar: repo } = usePersistence()
  const [marks, setMarks] = useState<CalendarMark[]>([])

  useEffect(() => {
    repo.getCalendar(moduleId).then((r) => {
      if (r) setMarks(r.marks)
    })
  }, [moduleId, repo])

  const toggleMark = useCallback(
    (date: string) => {
      setMarks((prev) => {
        const has = prev.some((m) => m.date === date)
        const next = has ? prev.filter((m) => m.date !== date) : [...prev, { date }]
        repo.putCalendar({ moduleId, marks: next })
        return next
      })
    },
    [moduleId, repo],
  )

  const isMarked = useCallback((date: string) => marks.some((m) => m.date === date), [marks])

  return { marks, toggleMark, isMarked }
}
