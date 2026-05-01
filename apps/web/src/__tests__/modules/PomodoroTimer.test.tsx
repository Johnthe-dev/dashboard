import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PomodoroTimer } from '../../components/modules/PomodoroTimer/PomodoroTimer'

// No persistence — no provider needed.
// Countdown tick behaviour is covered by usePomodoro.test.ts.
// These tests verify UI state: button visibility, phase labels, session display.

describe('PomodoroTimer', () => {
  it('shows the "Focus" phase label initially', () => {
    render(<PomodoroTimer />)
    expect(screen.getByText('Focus')).toBeInTheDocument()
  })

  it('shows "25:00" as the initial time', () => {
    render(<PomodoroTimer />)
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('SVG ring has role="img" with an accessible label', () => {
    render(<PomodoroTimer />)
    const ring = screen.getByRole('img')
    expect(ring).toBeInTheDocument()
    expect(ring.getAttribute('aria-label')).toMatch(/focus/i)
    expect(ring.getAttribute('aria-label')).toMatch(/25:00/i)
  })

  it('shows "Session 1" initially', () => {
    render(<PomodoroTimer />)
    expect(screen.getByText('Session 1')).toBeInTheDocument()
  })

  it('renders 4 session dots', () => {
    render(<PomodoroTimer />)
    const dotsContainer = screen.getByLabelText(/sessions completed/i)
    expect(dotsContainer.children).toHaveLength(4)
  })

  it('Start (▶) button is shown initially', () => {
    render(<PomodoroTimer />)
    expect(screen.getByRole('button', { name: 'Start timer' })).toBeInTheDocument()
  })

  it('Reset and Skip buttons are always visible', () => {
    render(<PomodoroTimer />)
    expect(screen.getByRole('button', { name: 'Reset timer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Skip to next phase' })).toBeInTheDocument()
  })

  it('clicking Start switches to the Pause button', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    await user.click(screen.getByRole('button', { name: 'Start timer' }))
    expect(screen.getByRole('button', { name: 'Pause timer' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start timer' })).not.toBeInTheDocument()
  })

  it('clicking Pause while running switches back to Start', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    await user.click(screen.getByRole('button', { name: 'Start timer' }))
    await user.click(screen.getByRole('button', { name: 'Pause timer' }))
    expect(screen.getByRole('button', { name: 'Start timer' })).toBeInTheDocument()
  })

  it('clicking Reset returns to 25:00 and Focus phase', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    await user.click(screen.getByRole('button', { name: 'Start timer' }))
    await user.click(screen.getByRole('button', { name: 'Reset timer' }))
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start timer' })).toBeInTheDocument()
  })

  it('clicking Skip from Focus transitions to Short Break (5:00)', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    await user.click(screen.getByRole('button', { name: 'Skip to next phase' }))
    expect(screen.getByText('Short Break')).toBeInTheDocument()
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('clicking Skip from Short Break transitions back to Focus (25:00)', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    await user.click(screen.getByRole('button', { name: 'Skip to next phase' })) // → short-break
    await user.click(screen.getByRole('button', { name: 'Skip to next phase' })) // → focus
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
  })

  it('completing one work session increments to "Session 2"', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    await user.click(screen.getByRole('button', { name: 'Skip to next phase' })) // skip work → short-break
    await user.click(screen.getByRole('button', { name: 'Skip to next phase' })) // skip break → focus
    expect(screen.getByText('Session 2')).toBeInTheDocument()
  })

  it('after 4 work sessions Skip transitions to Long Break (15:00)', async () => {
    const user = userEvent.setup()
    render(<PomodoroTimer />)
    // 4 work skips, 3 break skips = 7 clicks total → 4th break is long break
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: 'Skip to next phase' })) // skip work
      if (i < 3) {
        await user.click(screen.getByRole('button', { name: 'Skip to next phase' })) // skip short-break
      }
    }
    expect(screen.getByText('Long Break')).toBeInTheDocument()
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })
})
