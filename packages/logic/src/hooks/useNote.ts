import { useState, useEffect, useCallback, useRef } from 'react'
import type { NoteRecord } from '../types/note'
import { usePersistence } from '../context/PersistenceContext'

const makeDefault = (moduleId: string): NoteRecord => ({
  moduleId,
  title: 'Untitled',
  body: '',
  updatedAt: 0,
  monoFont: false,
})

export function useNote(moduleId: string) {
  const { note: repo } = usePersistence()
  const [note, setNote] = useState<NoteRecord>(makeDefault(moduleId))
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    repo.getNote(moduleId).then((record) => {
      if (record) setNote(record)
    })
  }, [moduleId, repo])

  const persist = useCallback(
    (updated: NoteRecord) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        repo.putNote({ ...updated, updatedAt: Date.now() })
      }, 500)
    },
    [repo],
  )

  const setTitle = useCallback(
    (title: string) => {
      setNote((prev) => {
        const next = { ...prev, title }
        persist(next)
        return next
      })
    },
    [persist],
  )

  const setBody = useCallback(
    (body: string) => {
      setNote((prev) => {
        const next = { ...prev, body }
        persist(next)
        return next
      })
    },
    [persist],
  )

  const toggleMonoFont = useCallback(() => {
    setNote((prev) => {
      const next = { ...prev, monoFont: !prev.monoFont }
      persist(next)
      return next
    })
  }, [persist])

  return { note, setTitle, setBody, toggleMonoFont }
}
