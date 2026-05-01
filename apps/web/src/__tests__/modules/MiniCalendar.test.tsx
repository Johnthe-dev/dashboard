import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { MiniCalendar } from '../../components/modules/MiniCalendar/MiniCalendar'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function renderCalendar(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <MiniCalendar moduleId={moduleId} />
    </WebPersistenceProvider>
  )
}

describe('MiniCalendar module', () => {
  it('current month name is shown in the header', () => {
    renderCalendar('cal-test-1')
    const currentMonthName = MONTH_NAMES[new Date().getMonth()]
    expect(screen.getByText(new RegExp(currentMonthName))).toBeInTheDocument()
  })

  it('all 7 weekday column headers are shown', () => {
    renderCalendar('cal-test-2')
    // DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(7)
    const labels = headers.map((h) => h.getAttribute('aria-label'))
    expect(labels).toContain('Sun')
    expect(labels).toContain('Mon')
    expect(labels).toContain('Tue')
    expect(labels).toContain('Wed')
    expect(labels).toContain('Thu')
    expect(labels).toContain('Fri')
    expect(labels).toContain('Sat')
  })

  it("today's date cell is present in the grid", () => {
    renderCalendar('cal-test-3')
    const today = new Date()
    const label = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const todayCell = screen.getByRole('gridcell', { name: new RegExp(label) })
    expect(todayCell).toBeInTheDocument()
  })

  it('month navigation: clicking ‹ changes the month label to previous month', async () => {
    const user = userEvent.setup()
    renderCalendar('cal-test-4')
    const now = new Date()
    const currentMonthName = MONTH_NAMES[now.getMonth()]
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevMonthName = MONTH_NAMES[prevMonth]
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText(new RegExp(prevMonthName))).toBeInTheDocument()
    expect(screen.queryByText(new RegExp(`^${currentMonthName}`))).not.toBeInTheDocument()
  })

  it('month navigation: clicking › changes the month label to next month', async () => {
    const user = userEvent.setup()
    renderCalendar('cal-test-5')
    const now = new Date()
    const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1
    const nextMonthName = MONTH_NAMES[nextMonth]
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText(new RegExp(nextMonthName))).toBeInTheDocument()
  })

  it('clicking a day in the current month toggles a mark (dot appears, aria-pressed changes)', async () => {
    const user = userEvent.setup()
    renderCalendar('cal-test-6')
    // Find today's cell and click it
    const today = new Date()
    const todayLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const todayCell = screen.getByRole('gridcell', { name: new RegExp(todayLabel) })
    expect(todayCell).toHaveAttribute('aria-pressed', 'false')
    await user.click(todayCell)
    await waitFor(() => {
      expect(todayCell).toHaveAttribute('aria-pressed', 'true')
    })
  })

  it('clicking the same day again removes the mark', async () => {
    const user = userEvent.setup()
    renderCalendar('cal-test-7')
    const today = new Date()
    const todayLabel = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    const todayCell = screen.getByRole('gridcell', { name: new RegExp(todayLabel) })
    await user.click(todayCell)
    await waitFor(() => expect(todayCell).toHaveAttribute('aria-pressed', 'true'))
    await user.click(todayCell)
    await waitFor(() => expect(todayCell).toHaveAttribute('aria-pressed', 'false'))
  })

  it('days outside the current month have tabIndex=-1', () => {
    renderCalendar('cal-test-8')
    const allCells = screen.getAllByRole('gridcell')
    // Some cells will be outside the current month (tabIndex -1)
    const outOfMonth = allCells.filter((c) => c.getAttribute('tabindex') === '-1')
    expect(outOfMonth.length).toBeGreaterThan(0)
  })
})
