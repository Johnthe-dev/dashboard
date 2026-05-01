import { useState, useEffect, useRef, useCallback } from 'react'
import type { CountdownStatus } from '../types/countdown'
import { usePersistence } from '../context/PersistenceContext'

const DEFAULT_DURATION = 5 * 60 * 1000

export function useCountdownTimer(moduleId: string) {
  const { countdown: repo } = usePersistence()
  const [durationMs, setDurationMs] = useState(DEFAULT_DURATION)
  const [remainingMs, setRemainingMs] = useState(DEFAULT_DURATION)
  const [status, setStatus] = useState<CountdownStatus>('idle')
  const rafRef = useRef<number | null>(null)
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    repo.getCountdown(moduleId).then((record) => {
      if (record) {
        setDurationMs(record.durationMs)
        setRemainingMs(record.remainingMs)
        setStatus(record.status === 'running' ? 'paused' : record.status)
      }
    })
  }, [moduleId, repo])

  const persist = useCallback(
    (dur: number, rem: number, st: CountdownStatus) => {
      repo.putCountdown({ moduleId, durationMs: dur, remainingMs: rem, status: st })
    },
    [moduleId, repo],
  )

  const tick = useCallback(
    (timestamp: number) => {
      const delta = timestamp - lastTickRef.current
      lastTickRef.current = timestamp
      setRemainingMs((prev) => {
        const next = Math.max(0, prev - delta)
        if (next === 0) {
          setStatus('done')
          persist(durationMs, 0, 'done')
          return 0
        }
        return next
      })
      rafRef.current = requestAnimationFrame(tick)
    },
    [durationMs, persist],
  )

  useEffect(() => {
    if (status === 'running') {
      lastTickRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [status, tick])

  const start = useCallback(() => {
    if (status === 'done' || remainingMs === 0) return
    setStatus('running')
    persist(durationMs, remainingMs, 'running')
  }, [status, remainingMs, durationMs, persist])

  const pause = useCallback(() => {
    setStatus('paused')
    persist(durationMs, remainingMs, 'paused')
  }, [durationMs, remainingMs, persist])

  const reset = useCallback(() => {
    setStatus('idle')
    setRemainingMs(durationMs)
    persist(durationMs, durationMs, 'idle')
  }, [durationMs, persist])

  const setDuration = useCallback(
    (minutes: number) => {
      const ms = Math.max(1, minutes) * 60 * 1000
      setDurationMs(ms)
      setRemainingMs(ms)
      setStatus('idle')
      persist(ms, ms, 'idle')
    },
    [persist],
  )

  return { durationMs, remainingMs, status, start, pause, reset, setDuration }
}
