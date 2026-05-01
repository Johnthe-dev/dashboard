import 'fake-indexeddb/auto'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WebPersistenceProvider } from '@focal/persistence-web'
import { TodoList } from '../../components/modules/TodoList/TodoList'

function renderTodoList(moduleId: string) {
  return render(
    <WebPersistenceProvider>
      <TodoList moduleId={moduleId} />
    </WebPersistenceProvider>
  )
}

describe('TodoList module', () => {
  it('renders the add-task input and + button', () => {
    renderTodoList('todo-test-1')
    expect(screen.getByLabelText('New task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add task' })).toBeInTheDocument()
  })

  it('adding a task via Enter key: task appears in the list', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-2')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'My first task{Enter}')
    expect(await screen.findByText('My first task')).toBeInTheDocument()
  })

  it('adding a task via + button: task appears in the list', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-3')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'Button task')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    expect(await screen.findByText('Button task')).toBeInTheDocument()
  })

  it('empty input: clicking + does not add an empty task', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-4')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })

  it('toggling checkbox: task gets done styling (aria-label changes)', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-5')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'Toggle me{Enter}')
    const checkBtn = await screen.findByRole('button', { name: 'Mark complete' })
    await user.click(checkBtn)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Mark incomplete' })).toBeInTheDocument()
    })
  })

  it('delete button: task is removed from list', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-6')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'Delete me{Enter}')
    await screen.findByText('Delete me')
    await user.click(screen.getByRole('button', { name: 'Delete task' }))
    await waitFor(() => {
      expect(screen.queryByText('Delete me')).not.toBeInTheDocument()
    })
  })

  it('clear completed: completed tasks are removed, incomplete remain', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-7')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'Keep me{Enter}')
    await user.type(input, 'Remove me{Enter}')
    await screen.findByText('Keep me')
    await screen.findByText('Remove me')
    // Mark "Remove me" as done
    const checkBtns = screen.getAllByRole('button', { name: 'Mark complete' })
    await user.click(checkBtns[1]) // second task is "Remove me"
    const clearBtn = await screen.findByRole('button', { name: /clear.*completed/i })
    await user.click(clearBtn)
    await waitFor(() => {
      expect(screen.queryByText('Remove me')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Keep me')).toBeInTheDocument()
  })

  it('subtask expand: click ⊕ button → subtask panel appears', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-8')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'Has subtasks{Enter}')
    const expandBtn = await screen.findByRole('button', { name: 'Show subtasks' })
    await user.click(expandBtn)
    expect(screen.getByPlaceholderText('Add subtask…')).toBeInTheDocument()
  })

  it('add subtask: type in subtask input → subtask appears', async () => {
    const user = userEvent.setup()
    renderTodoList('todo-test-9')
    const input = screen.getByLabelText('New task')
    await user.type(input, 'Parent task{Enter}')
    const expandBtn = await screen.findByRole('button', { name: 'Show subtasks' })
    await user.click(expandBtn)
    const subtaskInput = screen.getByPlaceholderText('Add subtask…')
    await user.type(subtaskInput, 'My subtask{Enter}')
    expect(await screen.findByText('My subtask')).toBeInTheDocument()
  })
})
