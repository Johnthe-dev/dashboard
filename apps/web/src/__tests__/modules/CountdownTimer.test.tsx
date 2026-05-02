import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { CountdownTimer } from '../../components/modules/CountdownTimer/CountdownTimer'

// Real timers are fine here — we test button-visibility state transitions only.
// Actual countdown tick behaviour is covered by the useCountdownTimer hook tests.

function renderTimer(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <CountdownTimer moduleId={moduleId} themeId="sticky-yellow" />
    </WebPersistenceProvider>,
  )
}

describe('CountdownTimer', () => {
  it('shows the duration input and Start button in idle state', async () => {
    renderTimer('ct-idle')
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByLabelText('Duration in minutes')).toBeInTheDocument()
  })

  it('canvas has role="img" with an accessible label', async () => {
    renderTimer('ct-a11y')
    await screen.findByRole('button', { name: 'Start' })
    const ring = screen.getByRole('img')
    expect(ring).toBeInTheDocument()
    expect(ring.getAttribute('aria-label')).toMatch(/countdown timer/i)
  })

  it('aria-live region exists for screen reader announcements', async () => {
    renderTimer('ct-live')
    await screen.findByRole('button', { name: 'Start' })
    expect(document.querySelector('[aria-live]')).toBeInTheDocument()
  })

  it('clicking Start hides the duration input and shows Pause', async () => {
    const user = userEvent.setup()
    renderTimer('ct-start')
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Duration in minutes')).not.toBeInTheDocument()
  })

  it('clicking Pause shows Start and Reset buttons', async () => {
    const user = userEvent.setup()
    renderTimer('ct-pause')
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    await user.click(await screen.findByRole('button', { name: 'Pause' }))
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
  })

  it('clicking Reset from paused returns to idle — duration input reappears', async () => {
    const user = userEvent.setup()
    renderTimer('ct-reset')
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    await user.click(await screen.findByRole('button', { name: 'Pause' }))
    await user.click(await screen.findByRole('button', { name: 'Reset' }))
    expect(await screen.findByLabelText('Duration in minutes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('changing the duration input updates the displayed minutes value', async () => {
    renderTimer('ct-duration')
    const input = await screen.findByLabelText('Duration in minutes')
    // fireEvent.change avoids user-event quirks with type="number" clear + retype
    fireEvent.change(input, { target: { value: '10' } })
    expect(input).toHaveValue(10)
  })

  it('Reset and Pause buttons are not shown in idle state', async () => {
    renderTimer('ct-idle-only')
    await screen.findByRole('button', { name: 'Start' })
    expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
  })

  it('Start button is not shown while running', async () => {
    const user = userEvent.setup()
    renderTimer('ct-no-start-while-running')
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    await screen.findByRole('button', { name: 'Pause' })
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
  })
})
