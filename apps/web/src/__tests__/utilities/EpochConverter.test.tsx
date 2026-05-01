import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EpochConverter } from '../../components/utilities/EpochConverter/EpochConverter'

describe('EpochConverter', () => {
  it('entering 0 seconds shows the Unix epoch date (1970)', async () => {
    const user = userEvent.setup()
    render(<EpochConverter />)
    const input = screen.getByLabelText('Unix epoch timestamp')
    await user.clear(input)
    await user.type(input, '0')
    // "1970" appears in multiple output rows (UTC, ISO, relative); check body text
    expect(document.body.textContent).toMatch(/1970/)
  })

  it('entering 1000000000 seconds shows a date around Sep 2001', async () => {
    const user = userEvent.setup()
    render(<EpochConverter />)
    const input = screen.getByLabelText('Unix epoch timestamp')
    await user.clear(input)
    await user.type(input, '1000000000')
    expect(document.body.textContent).toMatch(/2001/)
    expect(document.body.textContent).toMatch(/Sep/)
  })

  it('switching unit to ms and entering 1000000000000 shows Sep 2001', async () => {
    const user = userEvent.setup()
    render(<EpochConverter />)
    await user.click(screen.getByRole('button', { name: 'ms' }))
    const input = screen.getByLabelText('Unix epoch timestamp')
    await user.clear(input)
    await user.type(input, '1000000000000')
    expect(document.body.textContent).toMatch(/2001/)
    expect(document.body.textContent).toMatch(/Sep/)
  })

  it('Now button populates the epoch input with a positive number', async () => {
    const user = userEvent.setup()
    render(<EpochConverter />)
    const nowBtns = screen.getAllByRole('button', { name: /now/i })
    await user.click(nowBtns[0])
    const value = (screen.getByLabelText('Unix epoch timestamp') as HTMLInputElement).value
    expect(value).toBeTruthy()
    expect(Number(value)).toBeGreaterThan(0)
  })

  it('Date-to-epoch section shows Seconds and Milliseconds rows when a date is entered', async () => {
    const user = userEvent.setup()
    render(<EpochConverter />)
    await user.type(screen.getByLabelText('Date and time input'), '2024-01-01T00:00')
    expect(document.body.textContent).toMatch(/Seconds/)
    expect(document.body.textContent).toMatch(/Milliseconds/)
  })

  it('non-numeric input is rejected by the number input and shows no results', async () => {
    const user = userEvent.setup()
    render(<EpochConverter />)
    const input = screen.getByLabelText('Unix epoch timestamp')
    await user.clear(input)
    await user.type(input, 'notanumber')
    // <input type="number"> rejects letters; value stays empty, no result table shown
    expect(document.body.textContent).not.toMatch(/UTC.*Thu|Thu.*UTC/)
  })
})
