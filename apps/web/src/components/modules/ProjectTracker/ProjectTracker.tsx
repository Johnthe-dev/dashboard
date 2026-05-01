import React, { useState } from 'react'
import { useProjectTracker } from '@focal/logic'
import styles from './ProjectTracker.module.scss'

interface ProjectTrackerProps {
  moduleId: string
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function ProjectTracker({ moduleId }: ProjectTrackerProps) {
  const { projects, getElapsed, addProject, toggleProject, renameProject, removeProject, totalElapsed } =
    useProjectTracker(moduleId)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const handleAdd = () => {
    if (draft.trim()) {
      addProject(draft.trim())
      setDraft('')
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const startEdit = (id: number, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const commitEdit = () => {
    if (editingId !== null && editName.trim()) {
      renameProject(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const handleEditKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  return (
    <div className={styles.root}>
      <div className={styles.addRow}>
        <input
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          placeholder="New project…"
          aria-label="New project name"
        />
        <button className={styles.addBtn} onClick={handleAdd} aria-label="Add project">
          +
        </button>
      </div>

      <ul className={styles.list}>
        {projects.map((project) => {
          const running = project.runningFrom !== null
          const elapsed = getElapsed(project)
          return (
            <li key={project.id} className={`${styles.item} ${running ? styles.running : ''}`}>
              <button
                className={`${styles.playBtn} ${running ? styles.playBtnActive : ''}`}
                onClick={() => toggleProject(project.id as number)}
                aria-label={running ? 'Pause' : 'Start'}
              >
                {running ? '⏸' : '▶'}
              </button>
              <div className={styles.info}>
                {editingId === project.id ? (
                  <input
                    className={styles.nameInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKey}
                    autoFocus
                  />
                ) : (
                  <button
                    className={styles.nameBtn}
                    onClick={() => startEdit(project.id as number, project.name)}
                  >
                    {project.name}
                  </button>
                )}
                <span className={`${styles.elapsed} ${running ? styles.elapsedRunning : ''}`}>
                  {formatElapsed(elapsed)}
                </span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => removeProject(project.id as number)}
                aria-label="Remove project"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>

      {projects.length > 0 && (
        <div className={styles.footer}>
          <span className={styles.totalLabel}>Total</span>
          <span className={styles.totalTime}>{formatElapsed(totalElapsed)}</span>
        </div>
      )}
    </div>
  )
}
