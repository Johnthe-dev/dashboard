import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JwtDecoder } from '../../components/utilities/JwtDecoder/JwtDecoder'

const VALID_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('JwtDecoder', () => {
  it('pasting a valid JWT and clicking Decode shows HEADER section with HS256', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, VALID_JWT)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    expect(screen.getByLabelText('Header')).toBeInTheDocument()
    expect(screen.getByText('HS256')).toBeInTheDocument()
  })

  it('pasting a valid JWT shows PAYLOAD section with sub and name values', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, VALID_JWT)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    expect(screen.getByLabelText('Payload')).toBeInTheDocument()
    expect(screen.getByText('1234567890')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('iat claim shows a human-readable date alongside the raw number', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, VALID_JWT)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    // iat = 1516239022, formatClaim returns "1516239022  (UTC date string)"
    const payloadSection = screen.getByLabelText('Payload')
    expect(payloadSection.textContent).toContain('1516239022')
    // Should contain a year from the UTC string
    expect(payloadSection.textContent).toMatch(/201[0-9]|202[0-9]/)
  })

  it('pasting a string without dots shows an error about JWT format', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, 'notajwttoken')
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert').textContent).toContain('3 parts')
  })

  it('pasting only 2 parts (no third) shows an error', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, 'part1.part2')
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('clicking Clear resets the view', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, VALID_JWT)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    expect(screen.getByLabelText('Header')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(screen.queryByLabelText('Header')).not.toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('the SIGNATURE section is shown with the raw base64url string', async () => {
    const user = userEvent.setup()
    render(<JwtDecoder />)
    const input = screen.getByLabelText('JWT token input')
    await user.type(input, VALID_JWT)
    await user.click(screen.getByRole('button', { name: 'Decode' }))
    const sigSection = screen.getByLabelText('Signature')
    expect(sigSection).toBeInTheDocument()
    // The signature is the third part
    expect(sigSection.textContent).toContain('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
  })
})
