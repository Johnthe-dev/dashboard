import { useState, useEffect, useRef, useCallback } from 'react'

export type PomodoroPhase = 'work' | 'short-break' | 'long-break'

const WORK_SECS = 25 * 60
const SHORT_BREAK_SECS = 5 * 60
const LONG_BREAK_SECS = 15 * 60
const SESSIONS_BEFORE_LONG = 4

function phaseDuration(phase: PomodoroPhase): number {
  if (phase === 'work') return WORK_SECS
  if (phase === 'short-break') return SHORT_BREAK_SECS
  return LONG_BREAK_SECS
}

function nextPhase(phase: PomodoroPhase, sessionCount: number): PomodoroPhase {
  if (phase === 'work') {
    return sessionCount % SESSIONS_BEFORE_LONG === 0 ? 'long-break' : 'short-break'
  }
  return 'work'
}

export interface PomodoroState {
  phase: PomodoroPhase
  secondsLeft: number
  sessionCount: number
  running: boolean
  progress: number
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
}

export function usePomodoro(): PomodoroState {
  const [phase, setPhase] = useState<PomodoroPhase>('work')
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECS)
  const [sessionCount, setSessionCount] = useState(0)
  const [running, setRunning] = useState(false)

  // Refs to avoid stale closures inside setInterval
  const phaseRef = useRef<PomodoroPhase>('work')
  const secondsRef = useRef(WORK_SECS)
  const sessionCountRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Keep refs in sync with state
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { secondsRef.current = secondsLeft }, [secondsLeft])
  useEffect(() => { sessionCountRef.current = sessionCount }, [sessionCount])

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const advancePhase = useCallback(() => {
    const currentPhase = phaseRef.current
    let newSessionCount = sessionCountRef.current
    if (currentPhase === 'work') {
      newSessionCount += 1
    }
    const newPhase = nextPhase(currentPhase, newSessionCount)
    const newSecs = phaseDuration(newPhase)

    phaseRef.current = newPhase
    secondsRef.current = newSecs
    sessionCountRef.current = newSessionCount

    setPhase(newPhase)
    setSecondsLeft(newSecs)
    setSessionCount(newSessionCount)
  }, [])

  const start = useCallback(() => {
    if (intervalRef.current !== null) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      if (secondsRef.current <= 1) {
        advancePhase()
      } else {
        secondsRef.current -= 1
        setSecondsLeft(secondsRef.current)
      }
    }, 1000)
  }, [advancePhase])

  const pause = useCallback(() => {
    clearTimer()
    setRunning(false)
  }, [clearTimer])

  const reset = useCallback(() => {
    clearTimer()
    const secs = phaseDuration(phaseRef.current)
    secondsRef.current = secs
    setSecondsLeft(secs)
    setRunning(false)
  }, [clearTimer])

  const skip = useCallback(() => {
    clearTimer()
    advancePhase()
    setRunning(false)
  }, [clearTimer, advancePhase])

  // Cleanup on unmount
  useEffect(() => {
    return () => { clearTimer() }
  }, [clearTimer])

  const phaseTotalSecs = phaseDuration(phase)
  const progress = secondsLeft / phaseTotalSecs

  return {
    phase,
    secondsLeft,
    sessionCount,
    running,
    progress,
    start,
    pause,
    reset,
    skip,
  }
}
