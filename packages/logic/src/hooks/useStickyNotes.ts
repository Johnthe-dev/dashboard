import { useState, useEffect, useCallback } from 'react'
import type { StickyNote } from '../types/stickynotes'
import { usePersistence } from '../context/PersistenceContext'

export function useStickyNotes(moduleId: string) {
  const { stickyNotes: repo } = usePersistence()
  const [notes, setNotes] = useState<StickyNote[]>([])

  useEffect(() => {
    repo.getStickyNotes(moduleId).then((r) => setNotes(r?.notes ?? []))
  }, [moduleId, repo])

  const save = useCallback(
    (nextNotes: StickyNote[]) => {
      setNotes(nextNotes)
      repo.putStickyNotes({ moduleId, notes: nextNotes })
    },
    [moduleId, repo],
  )

  const addNote = useCallback(() => {
    save([{ id: Date.now(), text: '' }, ...notes])
  }, [notes, save])

  const updateNote = useCallback(
    (id: number, text: string) => {
      save(notes.map((n) => (n.id === id ? { ...n, text } : n)))
    },
    [notes, save],
  )

  const deleteNote = useCallback(
    (id: number) => {
      save(notes.filter((n) => n.id !== id))
    },
    [notes, save],
  )

  return { notes, addNote, updateNote, deleteNote }
}
