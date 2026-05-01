import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { HabitTracker } from '../../components/modules/HabitTracker/HabitTracker'

function renderHabits(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <HabitTracker moduleId={moduleId} />
    </WebPersistenceProvider>,
  )
}

describe('HabitTracker', () => {
  it('renders 7 day column header cells', async () => {
    renderHabits('ht-days')
    await screen.findByRole('button', { name: 'Add habit' })
    // Day cells have aria-label set to the date string (YYYY-MM-DD)
    const dayCells = screen.getAllByLabelText(/^\d{4}-\d{2}-\d{2}$/)
    expect(dayCells).toHaveLength(7)
  })

  it('renders the "Add habit" button', async () => {
    renderHabits('ht-add-btn')
    expect(await screen.findByRole('button', { name: 'Add habit' })).toBeInTheDocument()
  })

  it('clicking "Add habit" opens the inline form', async () => {
    const user = userEvent.setup()
    renderHabits('ht-open-form')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    expect(screen.getByLabelText('New habit name')).toBeInTheDocument()
  })

  it('typing a name and clicking ✓ adds the habit', async () => {
    const user = userEvent.setup()
    renderHabits('ht-add')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Meditate')
    await user.click(screen.getByRole('button', { name: 'Confirm add habit' }))
    expect(await screen.findByText('Meditate')).toBeInTheDocument()
  })

  it('typing a name and pressing Enter adds the habit', async () => {
    const user = userEvent.setup()
    renderHabits('ht-add-enter')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Read{Enter}')
    expect(await screen.findByText('Read')).toBeInTheDocument()
  })

  it('each habit row has 7 completion cell buttons', async () => {
    const user = userEvent.setup()
    renderHabits('ht-cells')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Exercise{Enter}')
    await screen.findByText('Exercise')
    const cellBtns = screen.getAllByRole('button', { name: /exercise on \d{4}-\d{2}-\d{2}/i })
    expect(cellBtns).toHaveLength(7)
  })

  it('clicking a cell marks it as completed (aria-pressed=true)', async () => {
    const user = userEvent.setup()
    renderHabits('ht-toggle-on')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Yoga{Enter}')
    await screen.findByText('Yoga')
    const cells = screen.getAllByRole('button', { name: /yoga on/i })
    await user.click(cells[6]) // today (last cell)
    expect(cells[6]).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking a completed cell un-marks it (aria-pressed=false)', async () => {
    const user = userEvent.setup()
    renderHabits('ht-toggle-off')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Run{Enter}')
    await screen.findByText('Run')
    const cells = screen.getAllByRole('button', { name: /run on/i })
    await user.click(cells[6])
    await user.click(cells[6])
    expect(cells[6]).toHaveAttribute('aria-pressed', 'false')
  })

  it('pressing Escape in the add form cancels without adding', async () => {
    const user = userEvent.setup()
    renderHabits('ht-cancel')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Never added')
    await user.keyboard('{Escape}')
    expect(screen.queryByText('Never added')).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add habit' })).toBeInTheDocument()
  })

  it('clicking the cancel (✕) button in the form cancels without adding', async () => {
    const user = userEvent.setup()
    renderHabits('ht-cancel-btn')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Ghost')
    await user.click(screen.getByRole('button', { name: 'Cancel add habit' }))
    expect(screen.queryByText('Ghost')).not.toBeInTheDocument()
  })

  it('empty habit name does not add a row', async () => {
    const user = userEvent.setup()
    renderHabits('ht-empty-name')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.click(screen.getByRole('button', { name: 'Confirm add habit' }))
    // No listitem (habit row) should exist
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('delete button removes the habit row', async () => {
    const user = userEvent.setup()
    renderHabits('ht-delete')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Temporary{Enter}')
    await screen.findByText('Temporary')
    await user.click(screen.getByRole('button', { name: 'Remove habit Temporary' }))
    expect(screen.queryByText('Temporary')).not.toBeInTheDocument()
  })

  it('multiple habits coexist with independent sets of 7 cells each', async () => {
    const user = userEvent.setup()
    renderHabits('ht-multi')
    await user.click(await screen.findByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Habit A{Enter}')
    await screen.findByText('Habit A')
    await user.click(screen.getByRole('button', { name: 'Add habit' }))
    await user.type(screen.getByLabelText('New habit name'), 'Habit B{Enter}')
    await screen.findByText('Habit B')
    expect(screen.getAllByRole('button', { name: /habit a on/i })).toHaveLength(7)
    expect(screen.getAllByRole('button', { name: /habit b on/i })).toHaveLength(7)
  })
})
