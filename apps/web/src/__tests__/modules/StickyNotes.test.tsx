import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { StickyNotes } from '../../components/modules/StickyNotes/StickyNotes'

// Each test uses a unique moduleId to isolate state within the shared IDB instance.

function renderStickyNotes(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <StickyNotes moduleId={moduleId} />
    </WebPersistenceProvider>,
  )
}

describe('StickyNotes', () => {
  it('renders an empty state with an "Add your first note" prompt', async () => {
    renderStickyNotes('sn-empty')
    expect(await screen.findByText(/add your first note/i)).toBeInTheDocument()
  })

  it('shows "0 notes" count when empty', async () => {
    renderStickyNotes('sn-count-zero')
    expect(await screen.findByText('0 notes')).toBeInTheDocument()
  })

  it('clicking + adds a new note card', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-add')
    await screen.findByText(/add your first note/i)
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    expect(await screen.findByRole('textbox', { name: /note 1/i })).toBeInTheDocument()
  })

  it('count updates to "1 note" after adding one note', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-count-one')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    expect(await screen.findByText('1 note')).toBeInTheDocument()
  })

  it('clicking "Add your first note" prompt also adds a note', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-empty-prompt')
    await user.click(await screen.findByText(/add your first note/i))
    expect(await screen.findByRole('textbox', { name: /note 1/i })).toBeInTheDocument()
  })

  it('typing in a note card saves the text', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-typing')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    const textarea = await screen.findByRole('textbox', { name: /note 1/i })
    await user.type(textarea, 'hello sticky')
    expect(textarea).toHaveValue('hello sticky')
  })

  it('adding multiple notes increments the count', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-multi')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    expect(await screen.findByText('3 notes')).toBeInTheDocument()
  })

  it('new notes are prepended (appear as Note 1)', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-prepend')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    const firstTextarea = await screen.findByRole('textbox', { name: 'Note 1' })
    await user.type(firstTextarea, 'first')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    // New note becomes Note 1; old note becomes Note 2
    const textareas = screen.getAllByRole('textbox')
    expect(textareas[0]).toHaveValue('')     // newest, prepended
    expect(textareas[1]).toHaveValue('first') // original
  })

  it('delete button removes the note and decrements the count', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-delete')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await screen.findByText('1 note')
    await user.click(screen.getByRole('button', { name: 'Delete note' }))
    expect(await screen.findByText('0 notes')).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('deleting one of several notes leaves the others intact', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-delete-one')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    const textareas = screen.getAllByRole('textbox')
    await user.type(textareas[1], 'keep me')
    await user.click(screen.getAllByRole('button', { name: 'Delete note' })[0])
    expect(await screen.findByText('1 note')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('keep me')
  })

  it('empty state is shown again after deleting all notes', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-back-to-empty')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await screen.findByText('1 note')
    await user.click(screen.getByRole('button', { name: 'Delete note' }))
    expect(await screen.findByText(/add your first note/i)).toBeInTheDocument()
  })

  it('each note card has an accessible textarea', async () => {
    const user = userEvent.setup()
    renderStickyNotes('sn-a11y')
    await screen.findByText('0 notes')
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    await user.click(screen.getByRole('button', { name: 'Add note' }))
    const textareas = screen.getAllByRole('textbox')
    expect(textareas).toHaveLength(2)
    textareas.forEach((ta) => expect(ta).toHaveAccessibleName())
  })
})
