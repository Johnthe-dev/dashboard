import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { QuickLinks } from '../../components/modules/QuickLinks/QuickLinks'

function renderQuickLinks(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <QuickLinks moduleId={moduleId} />
    </WebPersistenceProvider>
  )
}

describe('QuickLinks module', () => {
  it('renders label and URL inputs with a + button', () => {
    renderQuickLinks('ql-test-1')
    expect(screen.getByLabelText('New link label')).toBeInTheDocument()
    expect(screen.getByLabelText('New link URL')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add link' })).toBeInTheDocument()
  })

  it('adding a link with label + URL: link button appears', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-2')
    await user.type(screen.getByLabelText('New link label'), 'My Link')
    await user.type(screen.getByLabelText('New link URL'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    expect(await screen.findByText('My Link')).toBeInTheDocument()
  })

  it('adding a link without label: does nothing', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-3')
    await user.type(screen.getByLabelText('New link URL'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    // No link items should appear in the list
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('adding a URL without https:// prepends https:// to the href', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-4')
    await user.type(screen.getByLabelText('New link label'), 'No Protocol')
    await user.type(screen.getByLabelText('New link URL'), 'example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    const link = await screen.findByRole('link', { name: /no protocol/i })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('link has target="_blank"', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-5')
    await user.type(screen.getByLabelText('New link label'), 'Blank Link')
    await user.type(screen.getByLabelText('New link URL'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    const link = await screen.findByRole('link', { name: /blank link/i })
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('delete button removes the link', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-6')
    await user.type(screen.getByLabelText('New link label'), 'Delete Me')
    await user.type(screen.getByLabelText('New link URL'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    await screen.findByText('Delete Me')
    await user.click(screen.getByRole('button', { name: 'Delete Delete Me' }))
    await waitFor(() => {
      expect(screen.queryByText('Delete Me')).not.toBeInTheDocument()
    })
  })

  it('edit button shows inline edit form', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-7')
    await user.type(screen.getByLabelText('New link label'), 'Edit Me')
    await user.type(screen.getByLabelText('New link URL'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    await screen.findByText('Edit Me')
    await user.click(screen.getByRole('button', { name: 'Edit Edit Me' }))
    expect(screen.getByLabelText('Link label')).toBeInTheDocument()
    expect(screen.getByLabelText('Link URL')).toBeInTheDocument()
  })

  it('saving edit: updates the link label', async () => {
    const user = userEvent.setup()
    renderQuickLinks('ql-test-8')
    await user.type(screen.getByLabelText('New link label'), 'Old Label')
    await user.type(screen.getByLabelText('New link URL'), 'https://example.com')
    await user.click(screen.getByRole('button', { name: 'Add link' }))
    await screen.findByText('Old Label')
    await user.click(screen.getByRole('button', { name: 'Edit Old Label' }))
    const labelInput = screen.getByLabelText('Link label')
    await user.clear(labelInput)
    await user.type(labelInput, 'New Label')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText('New Label')).toBeInTheDocument()
    expect(screen.queryByText('Old Label')).not.toBeInTheDocument()
  })
})
