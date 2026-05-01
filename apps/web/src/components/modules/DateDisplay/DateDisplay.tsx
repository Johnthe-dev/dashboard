import { useState, useEffect } from 'react'
import styles from './DateDisplay.module.scss'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getDateParts(d: Date) {
  return {
    dayOfWeek: DAYS[d.getDay()],
    date: d.getDate(),
    month: MONTHS[d.getMonth()],
  }
}

function msUntilNextMinute() {
  const now = new Date()
  return (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
}

export function DateDisplay() {
  const [parts, setParts] = useState(() => getDateParts(new Date()))

  useEffect(() => {
    // Sync at the turn of each minute so the date updates at midnight
    let timeout: ReturnType<typeof setTimeout>

    function tick() {
      setParts(getDateParts(new Date()))
      timeout = setTimeout(tick, msUntilNextMinute())
    }

    timeout = setTimeout(tick, msUntilNextMinute())
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className={styles.root}>
      <time
        dateTime={new Date().toISOString().slice(0, 10)}
        className={styles.inner}
        aria-label={`${parts.dayOfWeek}, ${parts.date} ${parts.month}`}
      >
        <span className={styles.dayOfWeek}>{parts.dayOfWeek}</span>
        <span className={styles.date}>{parts.date}</span>
        <span className={styles.month}>{parts.month}</span>
      </time>
    </div>
  )
}
