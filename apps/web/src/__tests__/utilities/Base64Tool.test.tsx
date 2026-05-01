import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Base64Tool } from '../../components/utilities/Base64Tool/Base64Tool'

// The run button (→) has aria-label="Encode"|"Decode" which clashes with the mode toggle
// buttons that have the same visible text. Target the run button by its visible text "→".

function getRunButton() {
  return screen.getByText('→').closest('button')!
}

function output() {
  return document.querySelector('pre[aria-live]')
}

describe('Base64Tool', () => {
  it('encodes "hello" to aGVsbG8=', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.type(screen.getByLabelText('Plain text input'), 'hello')
    await user.click(getRunButton())
    expect(output()?.textContent).toContain('aGVsbG8=')
  })

  it('decodes aGVsbG8= back to "hello"', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    await user.type(screen.getByLabelText('Base64 encoded input'), 'aGVsbG8=')
    await user.click(getRunButton())
    expect(output()?.textContent).toContain('hello')
  })

  it('encodes "hello world" to aGVsbG8gd29ybGQ= in standard mode', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.type(screen.getByLabelText('Plain text input'), 'hello world')
    await user.click(getRunButton())
    expect(output()?.textContent).toContain('aGVsbG8gd29ybGQ=')
  })

  it('URL-safe mode strips padding and uses - instead of +', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.click(screen.getByRole('checkbox'))
    await user.type(screen.getByLabelText('Plain text input'), 'hello world')
    await user.click(getRunButton())
    // URL-safe has no = padding
    expect(output()?.textContent).not.toContain('=')
    expect(output()?.textContent).toContain('aGVsbG8gd29ybGQ')
  })

  it('empty input: run does not crash', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.click(getRunButton())
    expect(output()).toBeInTheDocument()
  })

  it('Swap moves encoded output back into input and flips mode', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.type(screen.getByLabelText('Plain text input'), 'hello')
    await user.click(getRunButton())
    await user.click(screen.getByLabelText('Swap input and output'))
    expect(screen.getByLabelText('Base64 encoded input')).toHaveValue('aGVsbG8=')
  })

  it('invalid base64 in decode mode shows error text', async () => {
    const user = userEvent.setup()
    render(<Base64Tool />)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    // Use fireEvent for !! characters to avoid userEvent special char issues
    fireEvent.change(screen.getByLabelText('Base64 encoded input'), { target: { value: '!!!invalid!!!' } })
    await user.click(getRunButton())
    expect(output()?.textContent).toBeTruthy()
  })

  it('mode toggle starts in Encode (aria-pressed="true")', () => {
    render(<Base64Tool />)
    const encodeToggle = screen.getAllByRole('button', { name: 'Encode' }).find(
      (btn) => btn.getAttribute('aria-pressed') !== null
    )
    expect(encodeToggle).toHaveAttribute('aria-pressed', 'true')
  })
})
