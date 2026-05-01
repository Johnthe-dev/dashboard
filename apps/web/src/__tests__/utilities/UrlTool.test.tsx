import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UrlTool } from '../../components/utilities/UrlTool/UrlTool'

describe('UrlTool — Encode/Decode tab', () => {
  it('encoding "hello world" produces "hello%20world"', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    const textarea = screen.getByLabelText('Input')
    await user.type(textarea, 'hello world')
    const preEl = document.querySelector('pre[aria-live]')
    expect(preEl?.textContent).toContain('hello%20world')
  })

  it('encoding "a=b&c=d" produces "a%3Db%26c%3Dd"', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    const textarea = screen.getByLabelText('Input')
    await user.type(textarea, 'a=b&c=d')
    const preEl = document.querySelector('pre[aria-live]')
    expect(preEl?.textContent).toContain('a%3Db%26c%3Dd')
  })

  it('switching to Decode and decoding "hello%20world" produces "hello world"', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    // Switch to decode mode
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    const textarea = screen.getByLabelText('Input')
    await user.type(textarea, 'hello%20world')
    const preEl = document.querySelector('pre[aria-live]')
    expect(preEl?.textContent).toContain('hello world')
  })

  it('invalid percent-encoding in decode mode shows an error', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    const textarea = screen.getByLabelText('Input')
    await user.type(textarea, '%GG')
    const preEl = document.querySelector('pre[aria-live]')
    // Should show error text
    expect(preEl?.textContent).toBeTruthy()
    // The error span should be present
    const errorSpan = document.querySelector('[class*="error"]')
    expect(errorSpan).toBeTruthy()
  })
})

describe('UrlTool — Parse URL tab', () => {
  it('parsing a URL shows hostname, pathname, and hash', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    await user.click(screen.getByRole('tab', { name: 'Parse URL' }))
    const urlInput = screen.getByLabelText('URL to parse')
    await user.type(urlInput, 'https://example.com/path?foo=bar&baz=qux#section')
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText('/path')).toBeInTheDocument()
    expect(screen.getByText('#section')).toBeInTheDocument()
  })

  it('query params foo=bar and baz=qux appear in the params table', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    await user.click(screen.getByRole('tab', { name: 'Parse URL' }))
    const urlInput = screen.getByLabelText('URL to parse')
    await user.type(urlInput, 'https://example.com/path?foo=bar&baz=qux')
    const table = screen.getByLabelText('Parsed URL components')
    expect(table.textContent).toContain('foo')
    expect(table.textContent).toContain('bar')
    expect(table.textContent).toContain('baz')
    expect(table.textContent).toContain('qux')
  })

  it('URL with port shows port 3000', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    await user.click(screen.getByRole('tab', { name: 'Parse URL' }))
    const urlInput = screen.getByLabelText('URL to parse')
    await user.type(urlInput, 'http://localhost:3000')
    const table = screen.getByLabelText('Parsed URL components')
    expect(table.textContent).toContain('3000')
  })

  it('bare hostname without scheme still parses (component prepends https://)', async () => {
    const user = userEvent.setup()
    render(<UrlTool />)
    await user.click(screen.getByRole('tab', { name: 'Parse URL' }))
    const urlInput = screen.getByLabelText('URL to parse')
    await user.type(urlInput, 'example.com/path')
    // Should not show "Could not parse URL" error
    expect(screen.queryByText('Could not parse URL')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Parsed URL components')).toBeInTheDocument()
  })
})
