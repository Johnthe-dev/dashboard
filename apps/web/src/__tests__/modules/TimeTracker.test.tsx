import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { ProjectTracker } from '../../components/modules/ProjectTracker/ProjectTracker'

// Real timers — we test button-visibility and list-state transitions only.
// Elapsed-time tick logic is covered by the useProjectTracker hook.

function renderTracker(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <ProjectTracker moduleId={moduleId} />
    </WebPersistenceProvider>,
  )
}

describe('TimeTracker', () => {
  it('renders the new project input and add button', async () => {
    renderTracker('tt-render')
    expect(await screen.findByLabelText('New project name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add project' })).toBeInTheDocument()
  })

  it('adding a project via Enter shows it in the list', async () => {
    const user = userEvent.setup()
    renderTracker('tt-add-enter')
    await user.type(await screen.findByLabelText('New project name'), 'Deep work{Enter}')
    expect(await screen.findByRole('button', { name: 'Deep work' })).toBeInTheDocument()
  })

  it('adding a project via the + button shows it in the list', async () => {
    const user = userEvent.setup()
    renderTracker('tt-add-btn')
    await user.type(await screen.findByLabelText('New project name'), 'Research')
    await user.click(screen.getByRole('button', { name: 'Add project' }))
    expect(await screen.findByRole('button', { name: 'Research' })).toBeInTheDocument()
  })

  it('empty project name does not add a row', async () => {
    const user = userEvent.setup()
    renderTracker('tt-empty')
    await screen.findByLabelText('New project name')
    await user.click(screen.getByRole('button', { name: 'Add project' }))
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument()
  })

  it('each project shows a Start (▶) button initially', async () => {
    const user = userEvent.setup()
    renderTracker('tt-start-btn')
    await user.type(await screen.findByLabelText('New project name'), 'Task{Enter}')
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('clicking Start changes the button to Pause', async () => {
    const user = userEvent.setup()
    renderTracker('tt-toggle-run')
    await user.type(await screen.findByLabelText('New project name'), 'Project A{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('clicking Pause changes the button back to Start', async () => {
    const user = userEvent.setup()
    renderTracker('tt-toggle-pause')
    await user.type(await screen.findByLabelText('New project name'), 'Project B{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Start' }))
    await user.click(await screen.findByRole('button', { name: 'Pause' }))
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('the Total footer appears once a project is added', async () => {
    const user = userEvent.setup()
    renderTracker('tt-total')
    await screen.findByLabelText('New project name')
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('New project name'), 'Focus{Enter}')
    expect(await screen.findByText('Total')).toBeInTheDocument()
  })

  it('clicking a project name opens an inline rename input', async () => {
    const user = userEvent.setup()
    renderTracker('tt-rename')
    await user.type(await screen.findByLabelText('New project name'), 'Old Name{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Old Name' }))
    expect(screen.getByDisplayValue('Old Name')).toBeInTheDocument()
  })

  it('pressing Enter in the rename input commits the new name', async () => {
    const user = userEvent.setup()
    renderTracker('tt-rename-commit')
    await user.type(await screen.findByLabelText('New project name'), 'Old{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Old' }))
    const renameInput = screen.getByDisplayValue('Old')
    await user.clear(renameInput)
    await user.type(renameInput, 'New Name{Enter}')
    expect(await screen.findByRole('button', { name: 'New Name' })).toBeInTheDocument()
  })

  it('pressing Escape in the rename input cancels without changing the name', async () => {
    const user = userEvent.setup()
    renderTracker('tt-rename-cancel')
    await user.type(await screen.findByLabelText('New project name'), 'Keeper{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Keeper' }))
    await user.keyboard('{Escape}')
    expect(await screen.findByRole('button', { name: 'Keeper' })).toBeInTheDocument()
  })

  it('the Remove project button deletes the row', async () => {
    const user = userEvent.setup()
    renderTracker('tt-delete')
    await user.type(await screen.findByLabelText('New project name'), 'Doomed{Enter}')
    await screen.findByRole('button', { name: 'Doomed' })
    await user.click(screen.getByRole('button', { name: 'Remove project' }))
    expect(screen.queryByRole('button', { name: 'Doomed' })).not.toBeInTheDocument()
  })

  it('Total footer is hidden after all projects are deleted', async () => {
    const user = userEvent.setup()
    renderTracker('tt-delete-total')
    await user.type(await screen.findByLabelText('New project name'), 'Temp{Enter}')
    await screen.findByText('Total')
    await user.click(screen.getByRole('button', { name: 'Remove project' }))
    expect(screen.queryByText('Total')).not.toBeInTheDocument()
  })

  it('add input is cleared after adding a project', async () => {
    const user = userEvent.setup()
    renderTracker('tt-clear')
    await user.type(await screen.findByLabelText('New project name'), 'Sprint{Enter}')
    await screen.findByRole('button', { name: 'Sprint' })
    expect(screen.getByLabelText('New project name')).toHaveValue('')
  })
})
