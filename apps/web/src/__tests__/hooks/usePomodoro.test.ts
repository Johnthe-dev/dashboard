import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePomodoro } from '@focal/logic'

describe('usePomodoro hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => usePomodoro())
    expect(result.current.phase).toBe('work')
    expect(result.current.secondsLeft).toBe(1500)
    expect(result.current.running).toBe(false)
    expect(result.current.sessionCount).toBe(0)
  })

  it('start() sets running to true', () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => { result.current.start() })
    expect(result.current.running).toBe(true)
  })

  it('pause() sets running to false', () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => { result.current.start() })
    act(() => { result.current.pause() })
    expect(result.current.running).toBe(false)
  })

  it('after start() and advancing 1 second, secondsLeft decreases to 1499', async () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => { result.current.start() })
    await act(async () => { vi.advanceTimersByTime(1000) })
    expect(result.current.secondsLeft).toBe(1499)
  })

  it('after start() and advancing full 25 min, phase becomes short-break', async () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => { result.current.start() })
    await act(async () => { vi.advanceTimersByTime(1500 * 1000) })
    expect(result.current.phase).toBe('short-break')
    expect(result.current.sessionCount).toBe(1)
    expect(result.current.secondsLeft).toBe(300)
  })

  it('after completing 4 work sessions, phase becomes long-break', async () => {
    const { result } = renderHook(() => usePomodoro())

    // Complete 4 work sessions and 3 short breaks (4th work ends → long break)
    for (let i = 0; i < 4; i++) {
      act(() => { result.current.start() })
      // complete work phase
      await act(async () => { vi.advanceTimersByTime(1500 * 1000) })
      // now in short-break (or long-break on 4th session)
      if (i < 3) {
        // complete the short break to go back to work
        act(() => { result.current.start() })
        await act(async () => { vi.advanceTimersByTime(300 * 1000) })
      }
    }
    expect(result.current.phase).toBe('long-break')
    expect(result.current.secondsLeft).toBe(900)
  })

  it('skip() from work phase transitions to short-break immediately', () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => { result.current.skip() })
    expect(result.current.phase).toBe('short-break')
    expect(result.current.sessionCount).toBe(1)
    expect(result.current.running).toBe(false)
  })

  it('reset() returns to the current phase initial time with running false', () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => { result.current.start() })
    // advance some time
    act(() => { vi.advanceTimersByTime(5000) })
    act(() => { result.current.reset() })
    expect(result.current.secondsLeft).toBe(1500)
    expect(result.current.running).toBe(false)
    // phase and sessionCount unchanged by reset
    expect(result.current.phase).toBe('work')
  })

  it('progress is 1.0 at start and decreases as time passes', async () => {
    const { result } = renderHook(() => usePomodoro())
    expect(result.current.progress).toBe(1.0)
    act(() => { result.current.start() })
    await act(async () => { vi.advanceTimersByTime(750 * 1000) })
    expect(result.current.progress).toBeLessThan(1.0)
    expect(result.current.progress).toBeGreaterThan(0)
  })
})
