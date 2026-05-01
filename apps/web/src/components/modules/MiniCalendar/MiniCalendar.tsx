import { useState } from 'react'
import { useCalendar } from '@focal/logic'
import styles from './MiniCalendar.module.scss'

interface MiniCalendarProps {
  moduleId: string
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_SHORT  = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 0 = Sunday
  const start = new Date(year, month, 1 - startOffset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function MiniCalendar({ moduleId }: MiniCalendarProps) {
  const today = new Date()
  const todayStr = toDateStr(today)

  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const { isMarked, toggleMark } = useCalendar(moduleId)

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const grid = getCalendarGrid(year, month)

  return (
    <div className={styles.root}>
      {/* Month navigation */}
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">‹</button>
        <span className={styles.monthLabel}>{MONTH_NAMES[month]} {year}</span>
        <button className={styles.navBtn} onClick={nextMonth} aria-label="Next month">›</button>
      </div>

      {/* Calendar grid */}
      <div className={styles.grid} role="grid" aria-label={`${MONTH_NAMES[month]} ${year}`}>
        {/* Weekday headers */}
        {DAY_SHORT.map((d, i) => (
          <div
            key={i}
            className={styles.weekday}
            role="columnheader"
            aria-label={DAY_LABELS[i]}
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {grid.map((day, i) => {
          const dateStr = toDateStr(day)
          const inMonth = day.getMonth() === month
          const isToday = dateStr === todayStr
          const marked = isMarked(dateStr)

          const cellClass = [
            styles.day,
            !inMonth ? styles.dayOut : '',
            isToday ? styles.dayToday : '',
          ].filter(Boolean).join(' ')

          return (
            <button
              key={i}
              role="gridcell"
              className={cellClass}
              onClick={() => { if (inMonth) toggleMark(dateStr) }}
              aria-label={`${day.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${marked ? ', marked' : ''}`}
              aria-pressed={inMonth ? marked : undefined}
              tabIndex={inMonth ? 0 : -1}
            >
              <span className={styles.dayNum}>{day.getDate()}</span>
              {marked && <span className={styles.dot} aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
