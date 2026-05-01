import React, { useRef, useState } from 'react'
import { useNote } from '@focal/logic'
import styles from './NotePad.module.scss'

interface NotePadProps {
  moduleId: string
}

export function NotePad({ moduleId }: NotePadProps) {
  const { note, setTitle, setBody, toggleMonoFont } = useNote(moduleId)
  const [editingTitle, setEditingTitle] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const handleTitleClick = () => {
    setEditingTitle(true)
    setTimeout(() => titleRef.current?.select(), 0)
  }

  const handleTitleBlur = () => setEditingTitle(false)

  const handleTitleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingTitle(false)
      titleRef.current?.blur()
    }
  }

  const charCount = note.body.length
  const wordCount = note.body.trim() === '' ? 0 : note.body.trim().split(/\s+/).length

  return (
    <div className={styles.root}>
      <div className={styles.titleRow}>
        {editingTitle ? (
          <input
            ref={titleRef}
            className={styles.titleInput}
            value={note.title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKey}
            autoFocus
          />
        ) : (
          <button className={styles.titleDisplay} onClick={handleTitleClick}>
            {note.title || 'Untitled'}
          </button>
        )}
        <button
          className={`${styles.monoToggle} ${note.monoFont ? styles.monoActive : ''}`}
          onClick={toggleMonoFont}
          title="Toggle monospace font"
          aria-label="Toggle monospace font"
          aria-pressed={note.monoFont}
        >
          Aa
        </button>
      </div>

      <textarea
        className={`${styles.textarea} ${note.monoFont ? styles.mono : ''}`}
        value={note.body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Start typing…"
        spellCheck
      />

      <span className={styles.charCount} aria-live="polite" aria-label={`${wordCount} words, ${charCount} characters`}>
        {wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars
      </span>
    </div>
  )
}
