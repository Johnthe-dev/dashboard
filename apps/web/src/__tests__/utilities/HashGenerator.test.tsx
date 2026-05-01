import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashGenerator } from '../../components/utilities/HashGenerator/HashGenerator'

// crypto.subtle is async. generateHashes() waits for the results table to appear
// before returning, so subsequent assertions can query the table synchronously.

async function generateHashes(text: string) {
  const user = userEvent.setup()
  render(<HashGenerator />)
  await user.type(screen.getByLabelText('Text to hash'), text)
  await user.click(screen.getByRole('button', { name: /generate hashes/i }))
  // Wait until the results table appears (all four hashes are computed)
  await screen.findByLabelText('Hash results')
  return user
}

function tableText() {
  return screen.getByLabelText('Hash results').textContent ?? ''
}

describe('HashGenerator', () => {
  it('Generate button is disabled when input is empty', () => {
    render(<HashGenerator />)
    expect(screen.getByRole('button', { name: /generate hashes/i })).toBeDisabled()
  })

  it('table shows all four algorithm names after generating', async () => {
    await generateHashes('hello')
    const text = tableText()
    for (const alg of ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']) {
      expect(text).toContain(alg)
    }
  })

  it('known MD5 for "hello"', async () => {
    await generateHashes('hello')
    expect(tableText()).toContain('5d41402abc4b2a76b9719d911017c592')
  })

  it('known SHA-256 for "hello"', async () => {
    await generateHashes('hello')
    expect(tableText()).toContain('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')
  })

  it('Uppercase toggle uppercases the displayed hashes', async () => {
    const user = await generateHashes('hello')
    await user.click(screen.getByRole('checkbox'))
    expect(tableText()).toContain('5D41402ABC4B2A76B9719D911017C592')
  })

  it('four Copy buttons appear (one per algorithm)', async () => {
    await generateHashes('hello')
    // Copy buttons have aria-label="Copy MD5 hash" etc.; match by partial name
    const copyBtns = screen.getAllByRole('button', { name: /copy .* hash/i })
    expect(copyBtns).toHaveLength(4)
  })

  it('changing input clears the previous hash table', async () => {
    const user = await generateHashes('hello')
    await user.type(screen.getByLabelText('Text to hash'), ' world')
    expect(screen.queryByLabelText('Hash results')).not.toBeInTheDocument()
  })
})
