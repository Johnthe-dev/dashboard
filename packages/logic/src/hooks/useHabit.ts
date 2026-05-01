import { useState, useEffect, useCallback } from 'react'
import type { HabitItem, HabitRecord } from '../types/habit'
import { HABIT_COLORS } from '../types/habit'
import { usePersistence } from '../context/PersistenceContext'

const makeDefault = (moduleId: string): HabitRecord => ({
  moduleId,
  habits: [],
  completions: [],
})

export function useHabit(moduleId: string) {
  const { habit: repo } = usePersistence()
  const [record, setRecord] = useState<HabitRecord>(makeDefault(moduleId))

  useEffect(() => {
    repo.getHabitRecord(moduleId).then((r) => {
      if (r) setRecord(r)
    })
  }, [moduleId, repo])

  const persist = useCallback(
    (next: HabitRecord) => {
      setRecord(next)
      repo.putHabitRecord(next)
    },
    [repo],
  )

  const addHabit = useCallback(
    (name: string, color?: string) => {
      const id = Date.now()
      const nextColor = color ?? HABIT_COLORS[record.habits.length % HABIT_COLORS.length]
      const next: HabitRecord = {
        ...record,
        habits: [...record.habits, { id, name, color: nextColor }],
      }
      persist(next)
    },
    [record, persist],
  )

  const removeHabit = useCallback(
    (id: number) => {
      const next: HabitRecord = {
        ...record,
        habits: record.habits.filter((h) => h.id !== id),
        completions: record.completions.filter((c) => !c.endsWith(`:${id}`)),
      }
      persist(next)
    },
    [record, persist],
  )

  const toggleCompletion = useCallback(
    (date: string, habitId: number) => {
      const key = `${date}:${habitId}`
      const completions = record.completions.includes(key)
        ? record.completions.filter((c) => c !== key)
        : [...record.completions, key]
      persist({ ...record, completions })
    },
    [record, persist],
  )

  const isCompleted = useCallback(
    (date: string, habitId: number) => {
      return record.completions.includes(`${date}:${habitId}`)
    },
    [record],
  )

  return {
    habits: record.habits as HabitItem[],
    addHabit,
    removeHabit,
    toggleCompletion,
    isCompleted,
  }
}
