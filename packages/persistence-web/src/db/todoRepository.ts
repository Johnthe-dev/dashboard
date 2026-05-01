import type { ITodoRepository } from '@focal/logic'
import type { TodoItem } from '@focal/logic'
import { getDb } from './client'
import { STORES } from './schema'

export class IdbTodoRepository implements ITodoRepository {
  async getTodosByModule(moduleId: string): Promise<TodoItem[]> {
    const db = await getDb()
    const all: TodoItem[] = await db.getAll(STORES.TODOS)
    return all.filter((t) => t.moduleId === moduleId)
  }

  async putTodo(todo: TodoItem): Promise<number> {
    const db = await getDb()
    return db.put(STORES.TODOS, todo) as Promise<number>
  }

  async deleteTodo(id: number): Promise<void> {
    const db = await getDb()
    await db.delete(STORES.TODOS, id)
  }

  async deleteTodosByModule(moduleId: string): Promise<void> {
    const db = await getDb()
    const all: TodoItem[] = await db.getAll(STORES.TODOS)
    const ids = all.filter((t) => t.moduleId === moduleId).map((t) => t.id as number)
    await Promise.all(ids.map((id) => db.delete(STORES.TODOS, id)))
  }

  async getAllTodos(): Promise<TodoItem[]> {
    const db = await getDb()
    return db.getAll(STORES.TODOS)
  }

  async clearAllTodos(): Promise<void> {
    const db = await getDb()
    await db.clear(STORES.TODOS)
  }
}
