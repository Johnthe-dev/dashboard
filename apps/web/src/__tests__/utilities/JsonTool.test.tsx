import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JsonTool } from '../../components/utilities/JsonTool/JsonTool'

// fireEvent.change is used instead of user.type for strings containing { } " characters
// because userEvent v14 treats { and } as keyboard modifier delimiters.

function setInput(el: HTMLElement, value: string) {
  fireEvent.change(el, { target: { value } })
}

describe('JsonTool', () => {
  it('Format prettifies valid JSON', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    setInput(screen.getByLabelText('JSON input'), '{"a":1}')
    await user.click(screen.getByRole('button', { name: 'Format' }))
    expect(screen.getByLabelText('Formatted JSON output').textContent).toContain('"a": 1')
  })

  it('Minify compacts valid JSON', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    setInput(screen.getByLabelText('JSON input'), '{ "a" : 1 , "b" : 2 }')
    await user.click(screen.getByRole('button', { name: 'Minify' }))
    expect(screen.getByLabelText('Formatted JSON output').textContent).toContain('{"a":1,"b":2}')
  })

  it('Validate shows ✓ Valid JSON for valid input', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    setInput(screen.getByLabelText('JSON input'), '{"valid":true}')
    await user.click(screen.getByRole('button', { name: 'Validate' }))
    expect(screen.getByText('✓ Valid JSON')).toBeInTheDocument()
  })

  it('Format shows ✗ error for invalid JSON', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    setInput(screen.getByLabelText('JSON input'), '{bad json')
    await user.click(screen.getByRole('button', { name: 'Format' }))
    expect(document.body.textContent).toContain('✗')
  })

  it('Clear resets input and output', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    const textarea = screen.getByLabelText('JSON input')
    setInput(textarea, '{"x":1}')
    await user.click(screen.getByRole('button', { name: 'Format' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(textarea).toHaveValue('')
    expect(screen.getByLabelText('Formatted JSON output').textContent).not.toContain('"x"')
  })

  it('Format preserves nested objects and arrays', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    setInput(screen.getByLabelText('JSON input'), '{"outer":{"inner":[1,2,3]}}')
    await user.click(screen.getByRole('button', { name: 'Format' }))
    const out = screen.getByLabelText('Formatted JSON output').textContent ?? ''
    expect(out).toContain('"outer"')
    expect(out).toContain('"inner"')
    expect(out).toContain('3')
  })

  it('Format preserves Unicode strings', async () => {
    const user = userEvent.setup()
    render(<JsonTool />)
    setInput(screen.getByLabelText('JSON input'), '{"greeting":"héllo wörld"}')
    await user.click(screen.getByRole('button', { name: 'Format' }))
    expect(screen.getByLabelText('Formatted JSON output').textContent).toContain('héllo wörld')
  })
})
