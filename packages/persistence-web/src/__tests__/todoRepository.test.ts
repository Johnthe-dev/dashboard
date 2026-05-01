import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { IdbTodoRepository } from '../db/todoRepository'
import type { TodoItem } from '@focal/logic'

const repo = new IdbTodoRepository()

describe('IdbTodoRepository', () => {
  beforeEach(async () => {
    await repo.clearAllTodos()
  })

  it('putTodo auto-assigns an id and getTodosByModule returns it', async () => {
    const todo: TodoItem = { moduleId: 'mod-1', text: 'Task A', done: false, createdAt: Date.now() }
    const id = await repo.putTodo(todo)
    expect(typeof id).toBe('number')
    expect(id).toBeGreaterThan(0)
    const results = await repo.getTodosByModule('mod-1')
    expect(results).toHaveLength(1)
    expect(results[0].text).toBe('Task A')
    expect(results[0].id).toBe(id)
  })

  it('putTodo with an existing id updates the record (upsert)', async () => {
    const todo: TodoItem = { moduleId: 'mod-1', text: 'Original', done: false, createdAt: Date.now() }
    const id = await repo.putTodo(todo)
    await repo.putTodo({ ...todo, id, text: 'Updated' })
    const results = await repo.getTodosByModule('mod-1')
    expect(results).toHaveLength(1)
    expect(results[0].text).toBe('Updated')
  })

  it('deleteTodo removes by id; item is gone from getTodosByModule', async () => {
    const id = await repo.putTodo({ moduleId: 'mod-1', text: 'To Delete', done: false, createdAt: Date.now() })
    await repo.deleteTodo(id)
    const results = await repo.getTodosByModule('mod-1')
    expect(results).toHaveLength(0)
  })

  it('deleteTodosByModule removes only that module items, leaving others', async () => {
    await repo.putTodo({ moduleId: 'mod-A', text: 'A task', done: false, createdAt: Date.now() })
    await repo.putTodo({ moduleId: 'mod-B', text: 'B task', done: false, createdAt: Date.now() })
    await repo.deleteTodosByModule('mod-A')
    const aItems = await repo.getTodosByModule('mod-A')
    const bItems = await repo.getTodosByModule('mod-B')
    expect(aItems).toHaveLength(0)
    expect(bItems).toHaveLength(1)
    expect(bItems[0].text).toBe('B task')
  })

  it('getAllTodos returns every item across all modules', async () => {
    await repo.putTodo({ moduleId: 'mod-1', text: 'One', done: false, createdAt: Date.now() })
    await repo.putTodo({ moduleId: 'mod-2', text: 'Two', done: false, createdAt: Date.now() })
    await repo.putTodo({ moduleId: 'mod-1', text: 'Three', done: true, createdAt: Date.now() })
    const all = await repo.getAllTodos()
    expect(all).toHaveLength(3)
  })

  it('clearAllTodos empties the store', async () => {
    await repo.putTodo({ moduleId: 'mod-1', text: 'Will be cleared', done: false, createdAt: Date.now() })
    await repo.clearAllTodos()
    const all = await repo.getAllTodos()
    expect(all).toHaveLength(0)
  })

  it('subtasks are persisted inside the subtasks array on the parent item', async () => {
    const todo: TodoItem = {
      moduleId: 'mod-1',
      text: 'Parent',
      done: false,
      createdAt: Date.now(),
      subtasks: [
        { id: 1, text: 'Sub One', done: false },
        { id: 2, text: 'Sub Two', done: true },
      ],
    }
    const id = await repo.putTodo(todo)
    const results = await repo.getTodosByModule('mod-1')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe(id)
    expect(results[0].subtasks).toHaveLength(2)
    expect(results[0].subtasks![0].text).toBe('Sub One')
    expect(results[0].subtasks![1].done).toBe(true)
  })
})
