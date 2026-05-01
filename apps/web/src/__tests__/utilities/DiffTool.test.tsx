import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiffTool } from '../../components/utilities/DiffTool/DiffTool'

function setLeft(value: string) {
  fireEvent.change(screen.getByLabelText('Original text'), { target: { value } })
}

function setRight(value: string) {
  fireEvent.change(screen.getByLabelText('Modified text'), { target: { value } })
}

describe('DiffTool', () => {
  it('identical texts show no added or removed lines', () => {
    render(<DiffTool />)
    setLeft('hello\nworld')
    setRight('hello\nworld')
    expect(screen.queryByText(/^\+\d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/^−\d/)).not.toBeInTheDocument()
  })

  it('added line on right appears with + prefix', () => {
    render(<DiffTool />)
    setLeft('line one')
    setRight('line one\nline two')
    const prefixes = document.querySelectorAll('[class*="linePrefix"]')
    const addedPrefixes = Array.from(prefixes).filter((el) => el.textContent === '+')
    expect(addedPrefixes.length).toBeGreaterThan(0)
  })

  it('removed line from left appears with − prefix', () => {
    render(<DiffTool />)
    setLeft('line one\nline two')
    setRight('line one')
    const prefixes = document.querySelectorAll('[class*="linePrefix"]')
    const removedPrefixes = Array.from(prefixes).filter((el) => el.textContent === '−')
    expect(removedPrefixes.length).toBeGreaterThan(0)
  })

  it('stats bar shows correct added/removed/unchanged counts', () => {
    render(<DiffTool />)
    setLeft('aaa\nbbb')
    setRight('aaa\nccc')
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByText('−1')).toBeInTheDocument()
    expect(screen.getByText('1 unchanged')).toBeInTheDocument()
  })

  it('Swap exchanges left and right panel content', async () => {
    const user = userEvent.setup()
    render(<DiffTool />)
    setLeft('original')
    setRight('modified')
    await user.click(screen.getByRole('button', { name: /Swap/i }))
    expect(screen.getByLabelText('Original text')).toHaveValue('modified')
    expect(screen.getByLabelText('Modified text')).toHaveValue('original')
  })

  it('JSON mode: semantically equal JSON with different whitespace shows no diff', async () => {
    const user = userEvent.setup()
    render(<DiffTool />)
    await user.click(screen.getByRole('button', { name: 'JSON' }))
    setLeft('{"a":1}')
    setRight('{ "a" : 1 }')
    expect(screen.queryByText('+1')).not.toBeInTheDocument()
    expect(screen.queryByText('−1')).not.toBeInTheDocument()
  })

  it('JSON mode: invalid JSON shows an error alert', async () => {
    const user = userEvent.setup()
    render(<DiffTool />)
    await user.click(screen.getByRole('button', { name: 'JSON' }))
    setLeft('not json')
    setRight('also not json')
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('a changed single line is shown as one removal + one addition', () => {
    render(<DiffTool />)
    setLeft('foo')
    setRight('bar')
    expect(screen.getByText('+1')).toBeInTheDocument()
    expect(screen.getByText('−1')).toBeInTheDocument()
  })
})
