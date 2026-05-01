import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { NotePad } from '../../components/modules/NotePad/NotePad'

function renderNotePad(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <NotePad moduleId={moduleId} />
    </WebPersistenceProvider>,
  )
}

describe('NotePad', () => {
  it('renders a textarea and the Untitled title', async () => {
    renderNotePad('np-render')
    expect(await screen.findByRole('button', { name: /untitled/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Start typing…')).toBeInTheDocument()
  })

  // --- Word and character count ---

  it('shows "0 words · 0 chars" when the note body is empty', async () => {
    renderNotePad('np-count-zero')
    await screen.findByPlaceholderText('Start typing…')
    expect(screen.getByText('0 words · 0 chars')).toBeInTheDocument()
  })

  it('counts a single word correctly', async () => {
    const user = userEvent.setup()
    renderNotePad('np-single-word')
    await screen.findByPlaceholderText('Start typing…')
    await user.type(screen.getByPlaceholderText('Start typing…'), 'hello')
    expect(screen.getByText('1 words · 5 chars')).toBeInTheDocument()
  })

  it('counts multiple words separated by spaces', async () => {
    const user = userEvent.setup()
    renderNotePad('np-multi-word')
    await screen.findByPlaceholderText('Start typing…')
    await user.type(screen.getByPlaceholderText('Start typing…'), 'hello world foo')
    expect(screen.getByText('3 words · 15 chars')).toBeInTheDocument()
  })

  it('whitespace-only input counts as 0 words', async () => {
    const user = userEvent.setup()
    renderNotePad('np-whitespace')
    await screen.findByPlaceholderText('Start typing…')
    await user.type(screen.getByPlaceholderText('Start typing…'), '   ')
    // 3 chars, 0 words
    expect(screen.getByText('0 words · 3 chars')).toBeInTheDocument()
  })

  it('counts words across newlines correctly', async () => {
    const user = userEvent.setup()
    renderNotePad('np-newlines')
    await screen.findByPlaceholderText('Start typing…')
    await user.type(screen.getByPlaceholderText('Start typing…'), 'one{Enter}two{Enter}three')
    expect(screen.getByText('3 words · 13 chars')).toBeInTheDocument()
  })

  it('character count includes spaces and punctuation', async () => {
    const user = userEvent.setup()
    renderNotePad('np-chars')
    await screen.findByPlaceholderText('Start typing…')
    await user.type(screen.getByPlaceholderText('Start typing…'), 'hi!')
    expect(screen.getByText('1 words · 3 chars')).toBeInTheDocument()
  })

  it('count updates live as text is typed', async () => {
    const user = userEvent.setup()
    renderNotePad('np-live')
    await screen.findByPlaceholderText('Start typing…')
    const textarea = screen.getByPlaceholderText('Start typing…')
    await user.type(textarea, 'one')
    expect(screen.getByText('1 words · 3 chars')).toBeInTheDocument()
    await user.type(textarea, ' two')
    expect(screen.getByText('2 words · 7 chars')).toBeInTheDocument()
  })

  // --- Title editing ---

  it('clicking the title enables inline editing', async () => {
    const user = userEvent.setup()
    renderNotePad('np-title')
    await screen.findByRole('button', { name: /untitled/i })
    await user.click(screen.getByRole('button', { name: /untitled/i }))
    // The title input has no aria-label; find it by its current display value
    expect(screen.getByDisplayValue(/untitled/i)).toBeInTheDocument()
  })

  it('pressing Enter commits the title', async () => {
    const user = userEvent.setup()
    renderNotePad('np-title-enter')
    await screen.findByRole('button', { name: /untitled/i })
    await user.click(screen.getByRole('button', { name: /untitled/i }))
    const titleInput = screen.getByDisplayValue(/untitled/i)
    await user.clear(titleInput)
    await user.type(titleInput, 'My Note{Enter}')
    expect(await screen.findByRole('button', { name: 'My Note' })).toBeInTheDocument()
  })

  // --- Mono font toggle ---

  it('Aa button toggles monospace mode', async () => {
    const user = userEvent.setup()
    renderNotePad('np-mono')
    await screen.findByPlaceholderText('Start typing…')
    const monoBtn = screen.getByRole('button', { name: 'Toggle monospace font' })
    expect(monoBtn).toHaveAttribute('aria-pressed', 'false')
    await user.click(monoBtn)
    expect(monoBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
