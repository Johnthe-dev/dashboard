import React, { useRef, useEffect, useState } from 'react'
import { useCountdownTimer } from '@focal/logic'
import type { ThemeId } from '@focal/logic'
import styles from './CountdownTimer.module.scss'

interface CountdownTimerProps {
  moduleId: string
  themeId: ThemeId
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function CountdownTimer({ moduleId, themeId }: CountdownTimerProps) {
  const { durationMs, remainingMs, status, start, pause, reset, setDuration } =
    useCountdownTimer(moduleId)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const liveRef = useRef<HTMLDivElement>(null)
  const [inputMinutes, setInputMinutes] = useState(5)
  const lastAnnouncedMinuteRef = useRef(-1)
  const lastAnnouncedStatusRef = useRef<string | null>(null)

  useEffect(() => {
    setInputMinutes(Math.round(durationMs / 60000))
  }, [durationMs])

  // Single effect handles all screen reader announcements
  useEffect(() => {
    if (!liveRef.current) return

    if (status !== lastAnnouncedStatusRef.current) {
      lastAnnouncedStatusRef.current = status
      lastAnnouncedMinuteRef.current = -1
      if (status === 'paused') liveRef.current.textContent = 'Timer paused'
      else if (status === 'done') liveRef.current.textContent = 'Timer finished'
      else liveRef.current.textContent = ''
      return
    }

    if (status === 'running') {
      const minute = Math.ceil(remainingMs / 60000)
      if (minute !== lastAnnouncedMinuteRef.current) {
        lastAnnouncedMinuteRef.current = minute
        liveRef.current.textContent = `${formatTime(remainingMs)} remaining`
      }
    }
  }, [remainingMs, status])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const size = Math.min(container.clientWidth, container.clientHeight)
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // CSS custom properties are not resolved by the Canvas 2D API — read them via getComputedStyle
    const computed = getComputedStyle(canvas)
    const colorBorder = computed.getPropertyValue('--module-border').trim()
    const colorAccent = computed.getPropertyValue('--module-accent').trim()
    const colorText = computed.getPropertyValue('--module-text').trim()
    const colorMuted = computed.getPropertyValue('--module-text-muted').trim()

    const cx = size / 2
    const cy = size / 2
    const outerR = size * 0.44
    const innerR = size * 0.32
    const progress = durationMs > 0 ? remainingMs / durationMs : 0
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + 2 * Math.PI * progress

    ctx.clearRect(0, 0, size, size)

    ctx.beginPath()
    ctx.arc(cx, cy, (outerR + innerR) / 2, 0, 2 * Math.PI)
    ctx.lineWidth = outerR - innerR
    ctx.strokeStyle = colorBorder
    ctx.stroke()

    if (progress > 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, (outerR + innerR) / 2, startAngle, endAngle)
      ctx.lineWidth = outerR - innerR
      ctx.strokeStyle = status === 'done' ? colorMuted : colorAccent
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    ctx.fillStyle = colorText
    ctx.font = `600 ${size * 0.13}px DM Sans, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(formatTime(remainingMs), cx, cy)
  }, [remainingMs, durationMs, status, themeId])

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    if (!isNaN(val)) {
      setInputMinutes(val)
      if (val >= 1) setDuration(val)
    }
  }

  return (
    <div className={styles.root}>
      {/* Visually hidden live region — announces time at each minute and on status changes */}
      <div
        ref={liveRef}
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
      />

      <div
        className={`${styles.ringContainer} ${status === 'done' ? styles.done : ''}`}
        ref={containerRef}
      >
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label={`Countdown timer: ${formatTime(remainingMs)}, ${status}`}
        />
      </div>

      <div className={styles.controls}>
        {status === 'idle' && (
          <div className={styles.durationRow}>
            <input
              type="number"
              className={styles.durationInput}
              value={inputMinutes}
              min={1}
              max={99}
              onChange={handleDurationChange}
              aria-label="Duration in minutes"
            />
            <span className={styles.durationLabel} aria-hidden="true">min</span>
          </div>
        )}
        <div className={styles.btnRow}>
          {status !== 'running' && status !== 'done' && (
            <button className={styles.btn} onClick={start}>
              Start
            </button>
          )}
          {status === 'running' && (
            <button className={styles.btn} onClick={pause}>
              Pause
            </button>
          )}
          {(status === 'paused' || status === 'done') && (
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={reset}>
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
