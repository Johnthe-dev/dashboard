import type { TodoItem } from '../types/todo'

export interface ITodoRepository {
  getTodosByModule(moduleId: string): Promise<TodoItem[]>
  putTodo(todo: TodoItem): Promise<number>
  deleteTodo(id: number): Promise<void>
  deleteTodosByModule(moduleId: string): Promise<void>
  getAllTodos(): Promise<TodoItem[]>
  clearAllTodos(): Promise<void>
}
