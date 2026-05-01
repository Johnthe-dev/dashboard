import { useRef } from 'react'
import { useStickyNotes } from '@focal/logic'
import styles from './StickyNotes.module.scss'

interface StickyNotesProps {
  moduleId: string
}

export function StickyNotes({ moduleId }: StickyNotesProps) {
  const { notes, addNote, updateNote, deleteNote } = useStickyNotes(moduleId)
  const newNoteRef = useRef<HTMLTextAreaElement>(null)

  const handleAdd = () => {
    addNote()
    // Focus the first card's textarea on next render
    setTimeout(() => {
      const first = document.querySelector<HTMLTextAreaElement>(
        `[data-module="${moduleId}"] textarea`,
      )
      first?.focus()
    }, 0)
  }

  return (
    <div className={styles.root} data-module={moduleId}>
      <div className={styles.toolbar}>
        <span className={styles.count} aria-live="polite">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </span>
        <button className={styles.addBtn} onClick={handleAdd} aria-label="Add note">
          +
        </button>
      </div>

      {notes.length === 0 ? (
        <div className={styles.empty}>
          <button className={styles.emptyPrompt} onClick={handleAdd}>
            + Add your first note
          </button>
        </div>
      ) : (
        <ul className={styles.grid} aria-label="Sticky notes">
          {notes.map((note, i) => (
            <li key={note.id} className={styles.card}>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteNote(note.id)}
                aria-label="Delete note"
              >
                ✕
              </button>
              <textarea
                ref={i === 0 ? newNoteRef : undefined}
                className={styles.noteText}
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value)}
                placeholder="Type a note…"
                aria-label={`Note ${i + 1}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
