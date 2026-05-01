import { usePomodoro } from '@focal/logic'
import styles from './PomodoroTimer.module.scss'

const RING_SIZE = 120
const STROKE_WIDTH = 8
const R = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * R

function padTwo(n: number): string {
  return String(n).padStart(2, '0')
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${padTwo(m)}:${padTwo(s)}`
}

const PHASE_LABELS: Record<string, string> = {
  work: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
}

export function PomodoroTimer() {
  const { phase, secondsLeft, sessionCount, running, progress, start, pause, reset, skip } =
    usePomodoro()

  const dashoffset = CIRCUMFERENCE * (1 - progress)
  const phaseLabel = PHASE_LABELS[phase]
  const isWork = phase === 'work'

  // Announce time every 60 seconds for screen readers (minutes boundary)
  const announceTime =
    secondsLeft % 60 === 0
      ? `${Math.floor(secondsLeft / 60)} minutes remaining`
      : undefined

  return (
    <div className={styles.root}>
      {/* SVG ring — using SVG, not canvas, so CSS vars resolve */}
      <div className={styles.ringWrapper}>
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          role="img"
          aria-label={`${phaseLabel} — ${formatTime(secondsLeft)} remaining`}
          className={styles.svg}
        >
          {/* Track */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--module-border)"
            strokeWidth={STROKE_WIDTH}
          />
          {/* Progress arc */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={R}
            fill="none"
            stroke={isWork ? 'var(--module-accent)' : 'var(--module-border)'}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            className={isWork ? styles.arcWork : styles.arcBreak}
          />
        </svg>

        {/* Center display */}
        <div className={styles.centerDisplay} aria-hidden="true">
          <span className={styles.timeDisplay}>{formatTime(secondsLeft)}</span>
          <span className={styles.phaseLabel}>{phaseLabel}</span>
        </div>
      </div>

      {/* Live region for screen readers */}
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {announceTime}
      </div>

      {/* Session dots */}
      <div className={styles.sessionDots} aria-label={`${sessionCount} sessions completed`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i < sessionCount % 4 || (sessionCount > 0 && sessionCount % 4 === 0 && i < 4) ? styles.dotFilled : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {running ? (
          <button className={styles.btn} onClick={pause} aria-label="Pause timer">
            ⏸
          </button>
        ) : (
          <button className={styles.btn} onClick={start} aria-label="Start timer">
            ▶
          </button>
        )}
        <button className={styles.btnSecondary} onClick={reset} aria-label="Reset timer">
          ↺
        </button>
        <button className={styles.btnSecondary} onClick={skip} aria-label="Skip to next phase">
          ⏭
        </button>
      </div>

      <div className={styles.sessionCount} aria-hidden="true">
        Session {sessionCount + 1}
      </div>
    </div>
  )
}
