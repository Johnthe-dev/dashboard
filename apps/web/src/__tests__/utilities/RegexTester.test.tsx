import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegexTester } from '../../components/utilities/RegexTester/RegexTester'

// userEvent v14 treats [ ] { } $ as special characters for keyboard descriptors.
// Use fireEvent.change to set pattern/test values that contain these characters.

function setPattern(value: string) {
  fireEvent.change(screen.getByLabelText('Regex pattern'), { target: { value } })
}

function setTestStr(value: string) {
  fireEvent.change(screen.getByLabelText('Test string'), { target: { value } })
}

describe('RegexTester', () => {
  it('\\d+ against "abc 123 def 456" shows 2 matches', async () => {
    render(<RegexTester />)
    setPattern('\\d+')
    setTestStr('abc 123 def 456')
    expect(screen.getByText('2 matches')).toBeInTheDocument()
  })

  it('pattern without i flag does not match different case', () => {
    render(<RegexTester />)
    setPattern('hello')
    setTestStr('HELLO')
    expect(screen.getByText(/No matches found/)).toBeInTheDocument()
  })

  it('enabling i flag matches case-insensitively', async () => {
    const user = userEvent.setup()
    render(<RegexTester />)
    setPattern('hello')
    setTestStr('HELLO')
    await user.click(screen.getByRole('button', { name: 'case insensitive' }))
    expect(screen.getByText('1 match')).toBeInTheDocument()
  })

  it('invalid pattern shows an error alert', () => {
    render(<RegexTester />)
    // [unclosed — [ is a regex special char; use fireEvent to avoid userEvent parsing it
    setPattern('[unclosed')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert').textContent).toContain('Invalid')
  })

  it('no matches shows "No matches found"', () => {
    render(<RegexTester />)
    setPattern('xyz')
    setTestStr('abc 123')
    expect(screen.getByText(/No matches found/)).toBeInTheDocument()
  })

  it('replace mode: (\\w+) with [$1] wraps each word', async () => {
    const user = userEvent.setup()
    render(<RegexTester />)
    setPattern('(\\w+)')
    setTestStr('hello world')
    await user.click(screen.getByRole('button', { name: 'Replace' }))
    // Set replacement using fireEvent to avoid $ being treated as special
    fireEvent.change(screen.getByLabelText('Replacement string'), { target: { value: '[$1]' } })
    const preEls = document.querySelectorAll('pre[aria-live]')
    const resultPre = preEls[preEls.length - 1]
    expect(resultPre?.textContent).toContain('[hello]')
    expect(resultPre?.textContent).toContain('[world]')
  })

  it('g flag (default on) finds all matches', () => {
    render(<RegexTester />)
    setPattern('(\\d+)')
    setTestStr('10 and 20 and 30')
    expect(screen.getByText('3 matches')).toBeInTheDocument()
  })

  it('capture groups appear in the match list', () => {
    render(<RegexTester />)
    setPattern('(\\d+)')
    setTestStr('10 and 20')
    // The match list section heading
    expect(screen.getByText('Matches')).toBeInTheDocument()
    // Each match item shows "groups:" label
    const groupEls = screen.getAllByText(/groups:/)
    expect(groupEls.length).toBeGreaterThan(0)
  })
})
