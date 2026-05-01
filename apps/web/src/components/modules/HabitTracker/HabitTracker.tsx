import { useState } from 'react'
import { useHabit, HABIT_COLORS } from '@focal/logic'
import styles from './HabitTracker.module.scss'

interface HabitTrackerProps {
  moduleId: string
}

function getDayLabels(): { date: string; label: string }[] {
  const result: { date: string; label: string }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const date = `${yyyy}-${mm}-${dd}`
    const label = d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)
    result.push({ date, label })
  }
  return result
}

export function HabitTracker({ moduleId }: HabitTrackerProps) {
  const { habits, addHabit, removeHabit, toggleCompletion, isCompleted } = useHabit(moduleId)
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const days = getDayLabels()

  const handleAdd = () => {
    const name = draft.trim()
    if (!name) return
    addHabit(name)
    setDraft('')
    setAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') {
      setAdding(false)
      setDraft('')
    }
  }

  const nextColor = HABIT_COLORS[habits.length % HABIT_COLORS.length]

  return (
    <div className={styles.root}>
      {/* Day header row */}
      <div className={styles.headerRow}>
        <div className={styles.habitNameCol} aria-hidden="true" />
        {days.map(({ date, label }) => (
          <div key={date} className={styles.dayCell} aria-label={date}>
            {label}
          </div>
        ))}
        <div className={styles.deleteCol} aria-hidden="true" />
      </div>

      {/* Habit rows */}
      <div className={styles.grid} role="list" aria-label="Habits">
        {habits.map((habit) => (
          <div key={habit.id} className={styles.habitRow} role="listitem">
            <div
              className={styles.habitName}
              style={{ borderLeft: `3px solid ${habit.color}` }}
              title={habit.name}
            >
              {habit.name}
            </div>
            {days.map(({ date }) => {
              const checked = isCompleted(date, habit.id)
              return (
                <button
                  key={date}
                  className={`${styles.cell} ${checked ? styles.cellChecked : ''}`}
                  style={checked ? { background: habit.color } : undefined}
                  onClick={() => toggleCompletion(date, habit.id)}
                  aria-label={`${habit.name} on ${date}: ${checked ? 'completed, click to undo' : 'not completed, click to mark done'}`}
                  aria-pressed={checked}
                >
                  {checked && <span className={styles.checkmark} aria-hidden="true">✓</span>}
                </button>
              )
            })}
            <button
              className={styles.deleteBtn}
              onClick={() => removeHabit(habit.id)}
              aria-label={`Remove habit ${habit.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add new habit */}
      <div className={styles.footer}>
        {adding ? (
          <div className={styles.addRow}>
            <span
              className={styles.colorDot}
              style={{ background: nextColor }}
              aria-hidden="true"
            />
            <input
              className={styles.addInput}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Habit name…"
              aria-label="New habit name"
              autoFocus
            />
            <button className={styles.confirmBtn} onClick={handleAdd} aria-label="Confirm add habit">
              ✓
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => { setAdding(false); setDraft('') }}
              aria-label="Cancel add habit"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className={styles.addBtn}
            onClick={() => setAdding(true)}
            aria-label="Add habit"
          >
            + Add habit
          </button>
        )}
      </div>
    </div>
  )
}
